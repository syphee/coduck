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


        const response = await notion.oauth.token({
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: notionOAuthCode,
            redirect_uri: process.env.NOTION_REDIRECT_URI,
        })

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


// to make sure userID exists first so users cannot just append from URL


// checks for user if exists, if not insert
const handleTelegramRegistration = async (userID) => {
    try {

        let query1 = await sql`
SELECT * 
FROM coduck.notion_users 
WHERE "userID" = ${userID}
  AND (user_access_token IS NOT NULL OR user_access_token != '');
`
        // return false if exists
        if (query1[0].user_access_token != "" && query1[0].duplicated_template_id != "") {
            query1.exists = true
            return query1;
        } else {
            let query2 = await sql`INSERT INTO coduck.notion_users("userID",platform)VALUES(${userID},'telegram');`;
            query2.exists = false
            const output = query2;

            return output
        }


    } catch (err) {
        console.error(`[authController Telegram userID Registration error]: ${err}`)
        throw err
    }

}

const handleRemoveTelegramNotion = async (userID) => {
    try {

        const query1 = await sql`
SELECT * 
FROM coduck.notion_users 
WHERE "userID" = ${userID}
  AND (user_access_token IS NOT NULL OR user_access_token != '');
`

        if (query1[0].user_access_token != "" && query1[0].duplicated_template_id != "") {
            return `Your telegram has been linked with notion.`
        } else {
            const query2 = await sql`INSERT INTO coduck.notion_users("userID",platform)VALUES(${userID},'telegram');`;

            const output = query2;

            return output
        }


    } catch (err) {
        console.error(`[authController Telegram userID Registration error]: ${err}`)
        throw err
    }

}

// should be "Add more coduck boards to notion"(?) idk im just tired rn bru
const registerUserToNotion = async (user_access_token, user_refresh_token, duplicated_template_id, workspace_id, workspace_name, platform, userID) => {
    let query;
    try {

        // handle telegram platforms
        if (query == 'telegram') {
            // last 2 values blank for now while i develop for telegram
            query = await sql`
    UPDATE coduck.notion_users 
    SET
        user_access_token = ${user_access_token},
        user_refresh_token = ${user_refresh_token},
        duplicated_template_id = ${duplicated_template_id},
        workspace_id = ${workspace_id},
        workspace_name = ${workspace_name}
    WHERE "userID" = ${userID} 
      AND platform = ${platform};
`;

        } else {
            // last 2 values blank for now while i develop for telegram

            // note that this will only allow 1 board, will add support for multiple boards in the future
            const query = await sql`
    INSERT INTO coduck.notion_users (
        user_access_token,
        user_refresh_token,
        duplicated_template_id,
        workspace_id,
        workspace_name,
        platform,
        "userID"
    ) VALUES (
        ${user_access_token},
        ${user_refresh_token},
        ${duplicated_template_id},
        ${workspace_id},
        ${workspace_name},
        ${platform},
        ${userID}
    )
    ON CONFLICT ("userID") 
    DO UPDATE SET 
        user_access_token = EXCLUDED.user_access_token,
        user_refresh_token = EXCLUDED.user_refresh_token,
        duplicated_template_id = EXCLUDED.duplicated_template_id,
        workspace_id = EXCLUDED.workspace_id,
        workspace_name = EXCLUDED.workspace_name;
`;

        }

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

export { notionAuth, registerUserToNotion, handleTelegramRegistration }