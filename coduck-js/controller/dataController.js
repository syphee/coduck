import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);

import { Client } from "@notionhq/client"


const getAllCoduckUsers = async () => {
  try {
    const query = await sql
      `select * from coduck.notion_users;`;
    const output = query;
    console.log(`[dataController getAllCoduckUsers Result]: ${output}`)

    return output
  } catch (err) {
    console.error(err)
  }
}

const getUserSources = async (userid) => {
  try {
    const query = await sql
      `select
                user_access_token,
                duplicated_template_id,
                workspace_id 
            from 
                coduck.notion_users 
            where 
                "userID" = ${userid};`;

    const userSources = []
    const user_sources_keypairs = query.map((value, index) => {
      const notion = new Client({
        auth: value[index].user_access_token
      });

      const dataSource = await notion.dataSources.retrieve({
        data_source_id: value[index].duplicated_template_id,
      });

      const title = dataSource.title.map((t) => t.plain_text).join("");

      userSources.push[{
        user_access_token: value[index].user_access_token,
        data_source_id: value[index].duplicated_template_id,
        data_source_name: title
      }]

    })

    return userSources


  } catch (error) {
    console.error(`[authController notionAuth Auth Response]: ${error}`)

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

export { getAllCoduckUsers, pingCoduckDB }