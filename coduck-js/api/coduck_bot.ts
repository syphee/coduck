// to run npx tsc everytime..

import { Bot, webhookCallback } from "grammy";
import dotenv from "dotenv";
import * as path from "path";
import { fetchQuery, resetQuery, fetchVoiceQuery } from "../controller/coduckController.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const coduck_key: string = process.env.coduck_bot!;
const gemini_key: string = process.env.GEMINI_API_KEY!;

const bot = new Bot(coduck_key);

bot.use(async (ctx, next) => {
  console.info(`[TELEGRAM_WEBHOOK] update_id=${ctx.update.update_id}`);
  await next();
});

bot.catch((error) => {
  console.error(`[ CODUCK_BOT:ERROR ]:${error}`)
})

bot.api.setMyCommands([
  { command: "start", description: "Ping the bot" },
  { command: "notion", description: "Link your notion account to allow Coduck to insert tasks." },
  { command: "new", description: "Clears chat history of the bot, removing message context." },
  { command: "help", description: "Display available commands and usage of Coduck." }
])


// to setup user's chosen table for tasks insertion
// should launch after doing /notion
// will prompt user for database id
// this will only work, and should only work when user has already logged into
// notion. 

// will add a "choose table" command once i settle this backbone
bot.command("setup", (ctx) => {
  try {
    const userID = ctx.from.id;


  } catch (err) {

  }


});

// to make user login into their notion account so they can do /setup
// redirects user to login notion, to make user login, set token
// into supabase.
//
// supabase will contain tele user id, notion user token, and database id
// callback will be t.me after logon
bot.command("notion", (ctx) => {
  try {
    const userID = ctx.from.id;


  } catch (err) {

  }


});

bot.command("help", async (ctx) => {
  try {

    await ctx.reply(
      `[Available Commands]
/start - Ping the bot
/notion - Link your notion account to allow Coduck to insert tasks.
/new - Clears chat history of the bot, removing message context.\n
      
[Usage]
Start by querying anything, or to orchestrate a task.
Examples: "Generate a Lasagna Recipe", "What is the current weather now?"," Add UI to Coduck" etc.
`
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("❌ Couldn't execute. Try again.");
  }
});

bot.command("start", (ctx) => ctx.reply(
  `[Available Commands]
/start - Ping the bot
/notion - Link your notion account to allow Coduck to insert tasks.
/new - Clears chat history of the bot, removing message context.\n
      
[Usage]
Start by querying anything, or to orchestrate a task.
Examples: "Generate a Lasagna Recipe", "What is the current weather now?"," Add UI to Coduck" etc.
`
));

bot.command("new", async (ctx) => {
  try {
    await resetQuery(ctx.chat.id);
    await ctx.reply("Started a fresh conversation.");
  } catch (error) {
    console.error(error);
    await ctx.reply("❌ Couldn't reset the conversation. Try again.");
  }
});

const splitChunks = (text, limit = 4000) => {
  if (!text) return [];
  if (text.length <= limit) return [text]

  const chunks = []
  let index = 0

  while (index < text.length) {
    if (index + limit >= text.length) {
      chunks.push(text.slice(index))
      break;
    }

    let endPos = index + limit
    const lastSpace = text.lastIndexOf(' ', endPos)

    if (lastSpace > index) {
      endPos = lastSpace
    }

    chunks.push(text.slice(index, endPos).trim())
    index = endPos + 1
  }
  return chunks
}

// handle unknown cmds sent by user
bot.use(async (ctx, next) => {
  if (ctx.message?.text?.startsWith("/")) {
    console.error(`[ CODUCK_BOT:ERROR ]: Unknown Command ${ctx.message?.text}`)
    return;
  }
  await next();
})





bot.on(["message:voice", "message:audio"], async (ctx) => {
  const media = ctx.message.voice ?? ctx.message.audio;
  const userID = ctx.chat.id

  // Bot API can only download files up to 20 MB
  if (media.file_size && media.file_size > 20 * 1024 * 1024) {
    return ctx.reply("That file is over 20 MB, which Telegram bots can't download.");
  }

  const transcribingMessage = await ctx.reply("⏳ Transcribing your voice memo...");

  try {
    const fileId = media.file_id;
    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) {
      throw new Error("Telegram did not provide a file path for the voice memo.");
    }

    const fileResponse = await fetch(
      `https://api.telegram.org/file/bot${coduck_key}/${file.file_path}`
    );
    if (!fileResponse.ok) {
      throw new Error(`Telegram file download failed with status ${fileResponse.status}.`);
    }

    const audioBytes = new Uint8Array(await fileResponse.arrayBuffer());
    const transcribedMemo = await fetchVoiceQuery(
      audioBytes,
      userID,
      media.mime_type ?? "audio/ogg"
    );
    const transcript = transcribedMemo.trim();
    if (!transcript) {
      await ctx.api.editMessageText(
        ctx.chat.id,
        transcribingMessage.message_id,
        "I couldn't hear any speech in that recording. Please try again."
      );
      return;
    }

    for (const part of splitChunks(transcript)) {
      await ctx.reply(`[Transcribed Message] : ${part}`);
    }

    const processedMemo = await ctx.reply("⏳ Processing your query...")
    const result = await fetchQuery(transcript, userID)
    await ctx.api.editMessageText(
      ctx.chat.id,
      processedMemo.message_id,
      String(result)
    );

  } catch (err) {
    console.error(err);
    await ctx.reply("Sorry, transcription failed. Try again in a moment.");
  }
});

// Normal message handler
bot.on("message", async (ctx) => {
  const loadingText = await ctx.reply("⏳ Processing your message...");

  try {
    const userInput = ctx.message?.text;
    const userID = ctx.chat.id
    if (!userInput) {
      return;
    }


    const result = await fetchQuery(userInput, userID);

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
export default webhookCallback(bot, "https", {
  timeoutMilliseconds: 50_000,
});