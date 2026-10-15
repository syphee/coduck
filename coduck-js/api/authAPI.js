import app from "./coduckAPI.js"

import { notionAuth } from "../controller/authController.js";
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL);

// notion auth
app.get("/api/auth", async (req, res) => {
  try {
    const result = notionAuth()
    console.log(`[authAPI:GET /api/auth Notion Result]: ${result}`)
    if (result) {
      return res.status(200).json({
        status: "success",
        comment: "Successfully linked notion account.",
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