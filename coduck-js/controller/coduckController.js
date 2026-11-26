import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import { insertCoduckRows } from "./notionController.js";

// might actually need to move this to notionController instead hais
const pushTaskResponse = async (formattedResult, auth) => {

  try {
    const taskBlocks = [];

    for (const t of formattedResult.tasks) {
      const stepLines =
        Array.isArray(t.steps) && t.steps.length
          ? t.steps.map((step, index) => `[${index + 1}]\t${step}`).join("\n")
          : "";
      const exitCriteriaString = `[Exit Criteria]:\t${t.exit_criteria}`;

      // inserts steps 1 by 1
      // awaited, so any failure propagates to the try/catch in taskQuery
      await insertCoduckRows({
        auth: auth,
        task: t.title,
        status: "Not started",
        description: [formattedResult.project_goal, stepLines, exitCriteriaString]
          .filter(Boolean)//filters empty strings, undefined inputs etc
          .join("\n\n"),
        projectName: formattedResult.project,
      });

      taskBlocks.push(
        [`• ${t.title}`, stepLines, exitCriteriaString]
          .filter(Boolean)
          .join("\n\n")
      );
    }

    return `Added to ${formattedResult.project}:\n\n${taskBlocks.join("\n\n")}`;
  } catch (err) {
    console.error(`[coduckController pushTaskResponse ERROR ] : ${err}`)
  }

}

export { pushTaskResponse };

