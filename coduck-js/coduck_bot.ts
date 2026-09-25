// to run npx tsc everytime..

import { Bot,webhookCallback } from "grammy";
import dotenv from "dotenv";
import * as path from "path";
import { fetchQuery } from "./controller/coduckController.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const coduck_key: string = process.env.coduck_bot!;
const gemini_key: string = process.env.gemini_api_key!;

console.log("coduck_bot key: " + coduck_key);
console.log("gemini_api_key: " + gemini_key);
const bot = new Bot(coduck_key);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

// Normal message handler
bot.on("message", async (ctx) => {
  const loadingText = await ctx.reply("⏳ Processing your message...");

  try {
    const userInput = ctx.message?.text;
    if (!userInput) {
      return;
    }

    
    const result = await fetchQuery(userInput);

    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingText.message_id,
      String(result)
    );
  } catch (error) {
    console.error(error);
    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingText.message_id,
      "❌ Sorry, something went wrong while processing that."
    );
  }
});

// bot.start();


// Export the webhook adapter for Vercel Serverless
export default webhookCallback(bot, "std/http");