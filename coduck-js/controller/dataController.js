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
    const query = await sql`
      SELECT
        user_access_token,
        duplicated_template_id,
        workspace_id
      FROM coduck.notion_users
      WHERE "userID" = ${userid};
    `;

    const userSources = await Promise.all(
      query.map(async (value) => {
        const notion = new Client({
          auth: value.user_access_token,
        });

        const dataSource = await notion.dataSources.retrieve({
          data_source_id: value.duplicated_template_id,
        });

        const title = dataSource.title
          .map((t) => t.plain_text)
          .join("");

        return {
          user_access_token: value.user_access_token,
          data_source_id: value.duplicated_template_id,
          data_source_name: title,
          workspace_id: value.workspace_id,
        };
      })
    );

    return userSources;
  } catch (error) {
    console.error(
      `[authController notionAuth Auth Response]: ${error}`
    );

    throw error;
  }
};


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