declare const notionAuth: (auth: any, platform: any) => Promise<import("@notionhq/client").OauthTokenResponse | undefined>;
declare const handleTelegramRegistration: (userID: any) => Promise<{
    exists: boolean;
    output: Record<string, any>[];
}>;
declare const registerUserToNotion: (user_access_token: any, user_refresh_token: any, duplicated_template_id: any, workspace_id: any, workspace_name: any, platform: any, userID: any) => Promise<undefined>;
export { notionAuth, registerUserToNotion, handleTelegramRegistration };
//# sourceMappingURL=authController.d.ts.map