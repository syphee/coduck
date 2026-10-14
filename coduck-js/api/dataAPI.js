import app from "./coduckAPI.js"

import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);




const getAllCoduckUsers = async () => {
  try {
    const query = await sql
      `select * from coduck.notion_users;`;
    const { output } = query;
    return output
  } catch (err) {
    console.err(err)
  }
}

app.get("/api/data/allUsers", async (req, res) => {
  try {
    const result = await getAllCoduckUsers()
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Get all users success. Returned ${result.length} rows.`,
        data: JSON.stringify(result.rows)
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Get all users failed.",
      })
    }
  } catch (err) {
    throw new Error(`[coduckAPI:POST /api/data NEONDB]: Connection Not Established. Reason:${err}`)
  }
})

const pingCoduckDB = async () => {
  try {
    const query = await sql
      `SELECT version()`;
    const { output } = query[0];
    return output
  } catch (err) {
    console.err(err)
  }

};
app.get("/api/data/ping", async (req, res) => {
  try {
    const result = await pingCoduckDB()
    if (result) {
      return res.status(200).json({
        status: "success",
        comment: "Coduck DB connection established.",
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Coduck DB connection failed.",
      })
    }
  } catch (err) {
    res.send(500)
    console.log(`[coduckAPI:POST /api/data NEONDB]:${err}`)
  }
})

export default app