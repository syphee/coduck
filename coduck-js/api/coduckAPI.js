// api/server.js
import express from "express";
import {taskQuery,generalQuery} from "../controller/geminiController.js";

const app = express();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const  query  = req.body.message;
    const userID = req.body.userID;
    console.log(`[CODUCK_API:POST /api/chat QUERY]:${query}\n`);
    console.log(`[CODUCK_API:POST /api/chat USER_ID]:${userID}\n`);
    if (!query) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    
    // Call Gemini here
    const response = await taskQuery(query, userID);

    res.json({
      reply: response,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate response",
    });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(3000, () => {
    console.log("API running on port 3000");
  });
}

export default app;
