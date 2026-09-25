// api/server.js
import express from "express";
import {taskQuery,generalQuery} from "../controller/geminiController.js";

const app = express();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const  query  = req.body.message;
    console.log(`[CODUCK_API:POST /api/chat]:${query}\n`);

    if (!query) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    
    // Call Gemini here
    const response = await taskQuery(query);

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
