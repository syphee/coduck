// api/server.js
import express from "express";
import multer from "multer";
import { taskQuery, transcribeAudio, resetChat } from "../controller/geminiController.js";
import { pushTaskResponse } from "../controller/coduckController.js";

const app = express();

import http from "http"
import {neon} from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);


const storage = multer.memoryStorage();
const upload = multer({
  storage:storage,
  limits:{fileSize:50*1024*1024}
})

app.use(express.json());

app.post("/api/chat",upload.single('voiceMemo'), async (req, res) => {
  try {
    const query = req.body.message || null;
    const voiceMemo = req.file || null;
    const userID = req.body.userID;
    const platform = req.body.platform || null;
    let response;
    console.log(`[CODUCK_API:POST /api/chat QUERY]:${query}\n`);
    console.log(`[CODUCK_API:POST /api/chat VOICE MEMO]:${voiceMemo}\n`);
    console.log(`[CODUCK_API:POST /api/chat USER_ID]:${userID}\n`);
    console.log(`[CODUCK_API:POST /api/chat PLATFORM]:${platform}\n`);

    // Call Gemini here
    if (query != null) {
      response = await taskQuery(query, userID,platform);
    }
    if (voiceMemo != null) {
      response = await transcribeAudio(voiceMemo, userID);
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


if (process.env.VERCEL !== "1") {
  app.listen(3000, () => {
    console.log("API running on port 3000");
  });
}

// add to notion 
app.post("/api/notion/insert", (req, res) => {
 try {
    const taskPayload = req.body.taskPayload
    const result = await pushTaskResponse(taskPayload)
    console.log(`[coduckAPI:POST /api/notion/insert Notion Insertion Result]: ${result ? "success" : "failed"}`)
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Successfully added task`,
        data: result
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Task was not added.",
      })
    }
  } catch (err) {
    throw new Error(`coduckAPI:POST /api/notion/insert ERROR Reason:${err}`)
  }
});

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
