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

// Task Generation Query
const taskQuery = async (query) => {
  console.log(`[GEMINI_CONTROLLER:TASK_QUERY]:${query}\n`);

  const SCHEMA = z.toJSONSchema(taskQuerySchema);
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input: query,
    system_instruction: CODUCK_SYSTEM_INSTRUCTION,
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
    return await generalQuery(query);
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
        ? t.steps.map((step) => `    - ${step}`).join("\n")
        : "";
    const exitCriteriaString = `[Exit Criteria]: ${t.exit_criteria}`;

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
const generalQuery = async (query) => {
  try {
    console.log(`[GEMINI_CONTROLLER:GENERAL_QUERY]:${query}\n`);

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: query,
    });

    return interaction.output_text;
  } catch (error) {
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

export { taskQuery, generalQuery };