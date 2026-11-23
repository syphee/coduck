import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });


const pushTaskResponse = async (formattedResult,auth)=>{

  for (const t of formattedResult.tasks) {

  }
}

export { fetchQuery,resetQuery,fetchVoiceQuery };

