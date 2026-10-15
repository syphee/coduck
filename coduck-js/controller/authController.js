import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.NEON_DATABASE_URL);


import { Client } from "@notionhq/client"

const notion = new Client()




const notionAuth = async (auth, platform) => {
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
            redirect_uri: process.env.NOTION_REDIRECT_URI
        })

        console.log(`[authController notionAuth Auth Response]: ${output}`)
        console.log(`[authController notionAuth Generated Token]: ${response}`)

        return response
    } catch (err) {
        console.error(err)
    }
}

// to decode jwt here
const getNotionUser = async (userID, platform) => {
    try {

        const query = await sql
            `select user_access_token,duplicated_template_id,workspace_id from coduck.notion_users where "userID" = ${userID} and "platform" = ${platform};`;
        const output = query;

        return output

    } catch (error) {
        console.error(`[authController notionAuth Auth Response]: ${output}`)

    }
}

const registerUserToNotion = async (user_access_token, user_refresh_token, duplicated_template_id, workspace_id, workspace_name) => {
    try {

        const query = await sql
            `INSERT INTO 
            coduck.notion_users(
                user_access_token,
                user_refresh_token,
                duplicated_template_id,
                workspace_id,
                workspace_name
            ) VALUES (
                ${user_access_token},
                ${user_refresh_token},
                ${duplicated_template_id},
                ${workspace_id},
                ${workspace_name}
            );`;
        const output = query;

        return output

    } catch (error) {
        console.error(`[authController notionAuth Auth Response]: ${output}`)

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

export { notionAuth,registerUserToNotion }