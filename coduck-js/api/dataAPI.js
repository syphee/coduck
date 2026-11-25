import app from "./coduckAPI.js"

import { deleteActiveUserSource,getAllCoduckUsers, pingCoduckDB,getUserSources,deleteUserSource } from "../controller/dataController.js"

app.get("/api/data/allUsers", async (req, res) => {
  try {
    const result = await getAllCoduckUsers()
    console.log(`[dataAPI:GET /api/data/allUsers NEONDB Result]: ${result}`)
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Get all users success. Returned ${result.length} rows.`,
        data: result
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Get all users failed.",
      })
    }
  } catch (err) {
    throw new Error(`[dataAPI:POST /api/data NEONDB]: Connection Not Established. Reason:${err}`)
  }
})


// get all user's datasources
app.post("/api/data/sources/", async (req, res) => {
  try {
    const userID = req.body.userID
    const platform = req.body.platform
    const result = await getUserSources(userID,platform)
    console.log(`[dataAPI:GET /api/data/sources NEONDB Result]: ${JSON.stringify(result)}`)
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Get all user's sources success. Returned ${result.length} rows.`,
        data: result
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Get all users failed.",
      })
    }
  } catch (err) {
    throw new Error(`[dataAPI:POST /api/data NEONDB]: Connection Not Established. Reason:${err}`)
  }
})


// delete user's datasources
app.delete("/api/data/sources/delete", async (req, res) => {
  try {
    const userID = req.body.userID
    const database_id = req.body.database_id
    const user_access_token = req.body.user_access_token
    const platform = req.body.platform

    const result = await deleteUserSource(platform,database_id,user_access_token,userID)

    console.log(`[dataAPI:DELETE /api/data/sources/delete NEONDB Result]: ${JSON.stringify(result)}`)
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Delete user source success. Returned ${result.length} rows.`,
        data: result
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Delete user source failed..",
      })
    }
  } catch (err) {
    throw new Error(`[dataAPI:DELETE /api/data/sources/delete NEONDB]: Connection Not Established. Reason:${err}`)
  }
})



// delete user's datasources
app.delete("/api/data/active-sources/delete", async (req, res) => {
  try {
    const userID = req.body.userID
    const database_id = req.body.database_id
    const user_access_token = req.body.user_access_token
    const platform = req.body.platform

    const result = await deleteActiveUserSource(platform,database_id,user_access_token,userID)

    console.log(`[dataAPI:DELETE /api/data/sources/delete NEONDB Result]: ${JSON.stringify(result)}`)
    if (result) {
      console.log(result)
      return res.status(200).json({
        status: "success",
        comment: `Delete user source success. Returned ${result.length} rows.`,
        data: result
      })
    }
    else {
      return res.status(404).json({
        status: "fail",
        comment: "Delete user source failed..",
      })
    }
  } catch (err) {
    throw new Error(`[dataAPI:DELETE /api/data/sources/delete NEONDB]: Connection Not Established. Reason:${err}`)
  }
})



app.get("/api/data/ping", async (req, res) => {
  try {
    const result = await pingCoduckDB()
    console.log(`[dataAPI:GET /api/data/ping NEONDB Result]: ${result}`)
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
    console.log(`[dataAPI:POST /api/data NEONDB]:${err}`)
  }
})

export default app