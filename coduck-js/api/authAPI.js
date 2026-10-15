import app from "./coduckAPI.js"

import { notionAuth, registerUserToNotion } from "../controller/authController.js";
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL);

// notion auth

// link user to workspace pages
app.get("/api/auth", async (req, res) => {
  try {
    const notionOAuthCode = req.query.code
    const result = await notionAuth(notionOAuthCode)
    console.log(`[authAPI:GET /api/auth Notion Result]: ${result}`)
    if (result) {

      const { user_access_token,
        user_refresh_token,
        duplicated_template_id,
        workspace_id,
        workspace_name } = result

      //insert info to db
      registerUserToNotion(user_access_token,
        user_refresh_token,
        duplicated_template_id,
        workspace_id,
        workspace_name)

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

export default app