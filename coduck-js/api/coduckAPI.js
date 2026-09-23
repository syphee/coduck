// api/server.js
import express from "express";
import { callGemini } from "../controller/coduckController.js";
const app = express();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const  query  = req.body.message;

    if (!query) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    // Call Gemini here
    const response = await callGemini(query);

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

app.listen(3000, () => {
  console.log("API running on port 3000");
});
