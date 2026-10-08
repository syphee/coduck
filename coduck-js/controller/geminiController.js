// dotenv configs
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// gemini imports
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

// coduck system instruction
import fs from "fs";
import { taskQuerySchema } from "../schema/coduck_schema.js";

const instructionFile = path.resolve(
  __dirname,
  "../system_instructions/coduck_tasks_instruction.txt"
);
const textFilePath = fs.existsSync(instructionFile) ? instructionFile : null;
if (!textFilePath) {
  throw new Error(`Missing system instruction file: ${instructionFile}`);
}

// zod imports
import { z } from "zod";

// controller imports
import { insertCoduckRows } from "./notionController.js";

const CODUCK_SYSTEM_INSTRUCTION = fs.readFileSync(textFilePath, "utf8");

// Conversation memory: one chain of interaction IDs per chat, per kind of call.
// previous_interaction_id carries conversation history only, so
// system_instruction and response_format are re-sent on every call.
// In-memory: chains are lost when the bot restarts.

// bot only retains history of related chainKeys, i.e if user query is related to
// tasking, it will only belong in the "tasking" chain. if user query is related to 
// general questions, it will only belong in the "general" chain
// chainkeys:
// taskQuery - task:<hash>
// generalQuery - general:<hash>

const chains = new Map();

const callGemini = async (chainKey, params) => {
  const previous = chains.get(chainKey);
  try {
    const interaction = await ai.interactions.create({
      ...params,
      ...(previous ? { previous_interaction_id: previous } : {}),
    });
    chains.set(chainKey, interaction.id);
    return interaction;
  } catch (err) {
    if (!previous) throw err;
    // The stored interaction may have expired: start a fresh chain
    console.warn(`[GEMINI_CONTROLLER:CHAIN_RESET] ${chainKey}: ${err.message}`);
    chains.delete(chainKey);
    const interaction = await ai.interactions.create(params);
    chains.set(chainKey, interaction.id);
    return interaction;
  }
};

// reset chat context
const resetChat = (chatId) => {
  //chains.delete(`task:${chatId}`);
  chains.delete(`general:${chatId}`);
};


// purely transcribing audio, no task querying processing here
const transcribeAudio = async (voiceMemo, userID) => {
  try {
    console.log(`[GEMINI_CONTROLLER:TASK_QUERY VOICE_MEMO EXISTS?]:${Boolean(voiceMemo)}\n`);
    console.log(`[GEMINI_CONTROLLER:TASK_QUERY USER_ID]:${userID}\n`);

    const base64 = voiceMemo.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: voiceMemo.mimetype ?? "audio/ogg", data: base64 } },
          ],
        },
      ],
      config: {
        audioTranscriptionConfig: {
          mode: "SMART",     // removes filler words + formats text; use "VERBATIM" for exact words
          languageCodes: [], // auto-detect; or e.g. ["en-US"] if you know the language
        },
      },
    });

    const transcriptParts =
      response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
    const text = transcriptParts
      .map((part) => part.audioTranscription?.text ?? part.text ?? "")
      .map((partText) => partText.trim())
      .filter(Boolean)
      .join(" ");

    return text
  } catch (err) {
    throw new Error(`Failed to transcribe voice memo: ${err instanceof Error ? err.message : String(err)}`);
  }

}

const splitChunks = (text, limit = 4000) => {
  if (!text) return [];
  if (text.length <= limit) return [text]

  const chunks = []
  let index = 0

  while (index < text.length) {
    if (index + limit >= text.length) {
      chunks.push(text.slice(index))
      break;
    }

    let endPos = index + limit
    const lastSpace = text.lastIndexOf(' ', end)

    if (lastSpace > index) {
      endPos = lastSpace
    }

    chunks.push(text.slice(index, endPos).trim())
    index = endPos + 1
  }
  return chunks
}

// Task Generation Query
const taskQuery = async (query, userID) => {
  console.log(`[GEMINI_CONTROLLER:TASK_QUERY QUERY]:${query}\n`);
  console.log(`[GEMINI_CONTROLLER:TASK_QUERY USER_ID]:${userID}\n`);

  const SCHEMA = z.toJSONSchema(taskQuerySchema);


  const interaction = await callGemini(`general:${userID}`, {
    model: "gemini-3.5-flash-lite",
    // model: "gemini-3.1-flash-lite",
    input: query,
    system_instruction: CODUCK_SYSTEM_INSTRUCTION,
    tools: [
      {
        "type": "url_context"
      },
      {
        "type": "google_search"
      }
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: SCHEMA,
    },
  });

  const result = interaction.output_text;
  const parsedResult = JSON.parse(result);
  console.log(
    `[GEMINI_CONTROLLER:TASK_QUERY:RAW GEMINI OUTPUT] ${JSON.stringify(parsedResult)}`
  );

  if (parsedResult.intent === "none") {
    return await generalQuery(query, userID);
  }

  if (parsedResult.intent === "create") {
    try {
      return await createTaskResponse(parsedResult);
    } catch (err) {
      console.error(`[GEMINI_CONTROLLER:TASK_QUERY:NOTION_INGESTION]: ${err}`);
      return "I understood the request, but saving to Notion failed. Check the server logs.";
    }
  }

  if (parsedResult.intent === "update") {
    return `Updated ${parsedResult.updates.length} task(s).`;
  }

  throw new Error(`Unexpected intent: ${parsedResult.intent}`);
};

// Inserts each task into Notion (sequentially, to respect rate limits)
// and returns the text reply for Telegram.
const createTaskResponse = async (parsedResult) => {
  const taskBlocks = [];

  for (const t of parsedResult.tasks) {
    const stepLines =
      Array.isArray(t.steps) && t.steps.length
        ? t.steps.map((step, index) => `[${index + 1}]\t${step}`).join("\n")
        : "";
    const exitCriteriaString = `[Exit Criteria]:\t${t.exit_criteria}`;

    // awaited, so any failure propagates to the try/catch in taskQuery
    await insertCoduckRows({
      task: t.title,
      status: "Not started",
      description: [parsedResult.project_goal, stepLines, exitCriteriaString]
        .filter(Boolean)
        .join("\n\n"),
      projectName: parsedResult.project,
    });

    taskBlocks.push(
      [`• ${t.title}`, stepLines, exitCriteriaString]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  return `Added to ${parsedResult.project}:\n\n${taskBlocks.join("\n\n")}`;
};

// anything other than a normal message query will be handled by this function
const generalQuery = async (query, chatId) => {
  try {
    console.log(`[GEMINI_CONTROLLER:GENERAL_QUERY]:${query}\n`);

    const hasURL = /https?:\/\/\S+/.test(query)
    const interaction = await callGemini(`general:${chatId}`, {
      model: "gemini-3.5-flash-lite",
      //model: "gemini-3.1-flash-lite",
      input: query,

      tools: [
        (hasURL ? (
        {
          "type": "url_context"
        }
        ) : {})
      ],
    });

    return interaction.output_text;
  } catch (error) {
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

export { taskQuery, generalQuery, resetChat, transcribeAudio };