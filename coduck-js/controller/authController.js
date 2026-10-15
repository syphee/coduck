import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);


import { Client } from "@notionhq/client"

const notion = new Client()




const notionAuth = async (auth) => {
    try {
        const notionOAuthCode = auth
        // const query = await sql
        //   `select * from coduck.notion_users;`;
        //const output = query;

        const output = notionOAuthCode
        const response = await notion.oauth.token({
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: notionOAuthCode,
            redirect_uri: process.env.NOTION_OAUTH_URL
        })

        console.log(`[authController notionAuth Auth Response]: ${output}`)
        console.log(`[authController notionAuth Generated Token]: ${response}`)

        return response
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

export { notionAuth }