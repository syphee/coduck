import app from "./coduckAPI.js"

import { notionAuth, registerUserToNotion, handleTelegramRegistration } from "../controller/authController.js";
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL);

// notion auth

// link user to workspace pages
app.get("/api/auth", async (req, res) => {
  try {
    const notionOAuthCode = req.query.code
    const state = req.query.state

    // separate platform and userID appended from state
    // e.g telegram:123
    const[platform,userID] = state.split(":")


    const result = await notionAuth(notionOAuthCode, platform)
    console.log(`[authAPI:GET /api/auth Notion Result]: ${result ? "success" : "failed"}`)
    if (result) {
      try {
        const { access_token,
          refresh_token,
          duplicated_template_id,
          workspace_id,
          workspace_name } = result

        //insert info to db
        await registerUserToNotion(access_token,
          refresh_token,
          duplicated_template_id,
          workspace_id,
          workspace_name,
          platform,
          userID)

          // has been inserted to neon
          .then((resolved) => {
            return res.status(200).json({
              status: "success",
              comment: "Successfully linked notion account."
            })
          },

            // has not been inserted to neon
            (rejected) => {
              return res.status(404).json({
                status: "fail",
                comment: "Notion Account linking to Coduck servers was unsuccessful.",
                reason: rejected
              })
            })

      } catch (err) {
        console.error(`[authAPI:GET /api/auth Register to Coduck error] :${err}`)
      }
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Notion Account linking was unsuccessful.",
      })
    }
  } catch (err) {
    res.send(500)
    console.log(`[authAPI:POST /api/auth ]:${err}`)
  }
})

app.post("/api/auth/telegram", async (req, res) => {
  try {
    const { userID } = req.body;

    if (!userID) {
      return res.status(400).json({
        status: "failed",
        comment: "Missing userID in request body."
      });
    }

    // Await execution. If it fails, it will throw an error and skip to catch block.
    await handleTelegramRegistration(userID);

    return res.status(200).json({
      status: "success",
      comment: "Telegram userID successfully registered in Coduck Servers."
    });
    
  } catch (err) {
    console.error(`[authAPI:POST /api/auth/telegram Error]:`, err);
    // Fixed syntax error from res.send(500)
    return res.status(500).json({ 
      status: "error", 
      message: err.message 
    }); 
  }
});

export default app