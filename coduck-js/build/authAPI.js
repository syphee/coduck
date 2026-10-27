import app from "./coduckAPI.js";
import { notionAuth, registerUserToNotion, handleTelegramRegistration } from "../controller/authController.js";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.NEON_DATABASE_URL);
// notion auth
// link user to workspace pages
app.get("/api/auth", async (req, res) => {
    try {
        const notionOAuthCode = req.query.code;
        const state = req.query.state;
        // separate platform and userID appended from state
        // e.g telegram:123
        const [platform, userID] = state.split(":");
        const result = await notionAuth(notionOAuthCode, platform);
        console.log(`[authAPI:GET /api/auth Notion Result]: ${result ? "success" : "failed"}`);
        if (result) {
            try {
                const { access_token, refresh_token, duplicated_template_id, workspace_id, workspace_name } = result;
                //insert info to db
                await registerUserToNotion(access_token, refresh_token, duplicated_template_id, workspace_id, workspace_name, platform, userID)
                    // has been inserted to neon
                    .then((resolved) => {
                    return res.status(200).json({
                        status: "success",
                        comment: "Successfully linked notion account."
                    });
                }, 
                // has not been inserted to neon
                (rejected) => {
                    return res.status(404).json({
                        status: "fail",
                        comment: "Notion Account linking to Coduck servers was unsuccessful.",
                        reason: rejected
                    });
                });
            }
            catch (err) {
                console.error(`[authAPI:GET /api/auth Register to Coduck error] :${err}`);
            }
        }
        else {
            return res.status(404).json({
                status: "fail",
                comment: "Notion Account linking was unsuccessful.",
            });
        }
    }
    catch (err) {
        res.send(500);
        console.log(`[authAPI:POST /api/auth ]:${err}`);
    }
});
// to handle if user clicks on the same link, adding auth to unlinking account
// api just basically to check if current user is existing in coduck
app.post("/api/auth/telegram", async (req, res) => {
    try {
        const userID = req.body.userID;
        const result = await handleTelegramRegistration(userID);
        console.log(`[authAPI:GET /api/auth Notion Result]: ${JSON.stringify(result)}`);
        // console.log(`[authAPI:GET /api/auth Notion Result]: ${result.output[0] ? "success" : "failed"}`)
        if (result.exists) {
            return res.status(200).json({
                status: "success",
                linked: result.exists,
                comment: "Telegram userID successfully registered in Coduck Servers."
            });
        }
        else {
            return res.status(404).json({
                status: "failed",
                comment: "Telegram userID registered in Coduck Servers failed."
            });
        }
    }
    catch (err) {
        res.send(500);
        console.log(`[authAPI:POST /api/auth ]:${err}`);
    }
});
export default app;
//# sourceMappingURL=authAPI.js.map