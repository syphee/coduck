import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);


import { Client } from "@notionhq/client"

const notion = new Client()

const response = await notion.oauth.token({
  client_id: process.env.OAUTH_CLIENT_ID,
  client_secret: process.env.OAUTH_CLIENT_SECRET,
  grant_type: "authorization_code",
  code: "abc123-authorization-code",
  redirect_uri: "https://example.com/callback"
})


const notionAuth = async (auth) => {
  try {
    const notionOAuthCode = auth
    // const query = await sql
    //   `select * from coduck.notion_users;`;
    //const output = query;

    const output = notionOAuthCode
    console.log(`[authController notionAuth Result]: ${output}`)

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

export {notionAuth}