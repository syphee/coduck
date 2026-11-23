import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// clear context
const resetQuery = async (userID) => {
  const API_URL = process.env.CODUCK_API_URL || "http://localhost:3000";
 
  const response = await fetch(`${API_URL}/api/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID: userID }),
  });
 
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
 
  const data = await response.json();
  return data.reply;
};

export { fetchQuery,resetQuery,fetchVoiceQuery };
