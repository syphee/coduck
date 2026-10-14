import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);

const getAllCoduckUsers = async () => {
  try {
    const query = await sql
      `select * from coduck.notion_users;`;
    const output = JSON.stringify(query);
    console.log(`[dataController getAllCoduckUsers Result]: ${output}`)

    return output
  } catch (err) {
    console.error(err)
  }
}


const pingCoduckDB = async () => {
  try {
    const query = await sql
      `SELECT version()`;
    const { version } = query[0];
    console.log(`[dataController getAllCoduckUsers Result]: ${version}`)

    return version
  } catch (err) {
    console.error(err)
  }

};

export {getAllCoduckUsers,pingCoduckDB}