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

const instructionFile = path.resolve(__dirname, "../system_instructions/coduck_tasks_instruction.txt");
const textFilePath = fs.existsSync(instructionFile) ? instructionFile : null;
if (!textFilePath) {
  throw new Error(`Missing system instruction file: ${instructionFile}`);
}

// zod imports 
import { z } from "zod";

//controller imports
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
  console.log(`[GEMINI_CONTROLLER:TASK_QUERY:RAW GEMINI OUTPUT] ${JSON.stringify(parsedResult)}`);

  if (parsedResult.intent === "none") {
    const generalResponse = await generalQuery(query);
    return generalResponse;
  }
  if (parsedResult.intent === "create") {

    // telegram reply handler and notion ingestion
    const generatedResponse = createTaskResponse(parsedResult)
    .catch((err)=>{
      console.error(`[GEMINI_CONTROLLER:TASK_QUERY:TASK_RESPONSE]: ${err}`)
    })

    return generatedResponse
  }
  if (parsedResult.intent === "update") {
    return `Updated ${parsedResult.updates.length} task(s).`;
  } else {
    throw new Error(`Unexpected intent: ${parsedResult}`);
  }

};

const createTaskResponse = async (parsedResult) => {
  
  // ingest to notion and return telegram text
  const task_list = parsedResult.tasks.map(t => {
    // format reply text to telegram
    let taskString = `• ${t.title}\n`;
    let taskGoal = t.project_goal
    let exitCriteriaString = `[Exit Criteria]: ${t.exit_criteria}`;
    // Check if steps exist for this specific task and append them
    if (t.steps && Array.isArray(t.steps)) {
      const stepLines = t.steps.map(step => `    - ${step}`).join("\n");
      taskString += `\n${stepLines}`;

      // add data to notion. this adds page per page
      ingestToNotion({
        task:t.title,
        status:"To Do",
        description:`${t.project_goal}\n\n${stepLines}\n\n${exitCriteriaString}`,
        projectName:parsedResult.project
      }).then(()=>{
        console.log(`[GEMINI_CONTROLLER:NOTION_INGESTION]:Added to Notion.\n`);

      }).catch((err)=>{
        console.error(`[GEMINI_CONTROLLER:TASK_QUERY:TASK_RESPONSE:NOTION_INGESTION]: ${err}`)
      })
    }

    taskString += `\n\n${exitCriteriaString}\n`;
    return taskString;
  }).join("\n\n");
  
  return `Added to ${parsedResult.project}:\n\n${task_list}`;
}

const ingestToNotion = (data)=>{
  insertCoduckRows({data}).catch((err)=>{
    console.error(`[GEMINI_CONTROLLER:TASK_QUERY:TASK_RESPONSE:NOTION_INGESTION]: ${err}`)
  })
}

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
