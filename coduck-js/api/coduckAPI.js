// api/server.js
import express from "express";
import multer from "multer";
import { taskQuery, generalQuery, resetChat } from "../controller/geminiController.js";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
  storage:storage,
  limits:{fileSize:50*1024*1024}
})
app.post("/api/chat", async (req, res) => {
  try {
    const query = req.body.message;
    const voiceMemo = req.file.buffer;
    const userID = req.body.userID;
    let response;
    console.log(`[CODUCK_API:POST /api/chat QUERY]:${query}\n`);
    console.log(`[CODUCK_API:POST /api/chat USER_ID]:${userID}\n`);

    
    // Call Gemini here
    if (query) {
      response = await taskQuery(query, userID);
    }
    if (voiceMemo) {
      response = await taskQuery(voiceMemo, userID);
    }

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

app.use(express.json());


if (process.env.VERCEL !== "1") {
  app.listen(3000, () => {
    console.log("API running on port 3000");
  });
}

// clear context  
app.post("/api/reset", (req, res) => {
  const userID = req.body.userID;
  console.log(`[CODUCK_API:POST /api/reset USER_ID]:${userID}\n`);

  if (userID === undefined || userID === null) {
    return res.status(400).json({
      error: "userID is required",
    });
  }

  resetChat(userID);

  res.json({
    reply: "Started a fresh conversation.",
  });
});

if (process.env.VERCEL !== "1") {
  app.listen(3000, () => {
    console.log("API running on port 3000");
  });
}

export default app;
