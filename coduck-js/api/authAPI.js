import app from "./coduckAPI.js"

import {neon} from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);


const NeonRequestHandler = async () => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  return version
};



app.get("/api/auth",async(req,res)=>{
  try{
    const result = NeonRequestHandler()
    if(result){
      res.send(200)
    } 
    else{
      res.send(404)
      throw new Error(`[coduckAPI:POST /api/data NEONDB]: Connection Not Established.`)
    }
  }catch(err){
    res.send(500)
    console.log(`[coduckAPI:POST /api/data NEONDB]:${err}`)
  }
})

export default app