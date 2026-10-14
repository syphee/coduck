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

export {getAllCoduckUsers,pingCoduckDB}