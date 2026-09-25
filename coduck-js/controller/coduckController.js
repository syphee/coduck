import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Normal Message Query
const fetchQuery = async (query) => {
  console.log(`[QUERY]:${query}\n`);
  const API_URL = process.env.CODUCK_API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: query,
      }),
    });

    console.log(`[RESPONSE]:${JSON.stringify(response)}\n`);

    // if (!response.ok) {
    //   console.log(`[ERROR]:${response.status} - ${response.statusText}\n`);
    //   throw new Error(`API returned ${response.status}`);
    // }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error(`[ERROR]:${error}\n`);
    throw error;
  }
};

export { fetchQuery };
