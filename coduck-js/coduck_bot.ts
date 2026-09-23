// to run npx tsc everytime..

import { Bot } from "grammy";
import dotenv from "dotenv";
import * as path from "path";
import { fetchQuery } from "./controller/coduckController.js";

dotenv.config({
  path: "../.env",
});
const coduck_key: string = process.env.coduck_bot!;
console.log("coduck_bot key: " + coduck_key);
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

bot.start();
