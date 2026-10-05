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

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

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
    const lastSpace = text.lastIndexOf(' ', end)

    if (lastSpace > index) {
      endPos = lastSpace
    }

    chunks.push(text.slice(index, endPos).trim())
    index = endPos + 1
  }
  return chunks
}






bot.on(["message:voice", "message:audio"], async (ctx) => {
  const media = ctx.message.voice ?? ctx.message.audio;
  const userID = ctx.chat.id

  // Bot API can only download files up to 20 MB
  if (media.file_size && media.file_size > 20 * 1024 * 1024) {
    return ctx.reply("That file is over 20 MB, which Telegram bots can't download.");
  }

  await ctx.reply("⏳ Transcribing your voice memo...");

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

    await ctx.reply(`[Transcribed Message]\n\n`)
    for (const part of splitChunks(transcribedMemo)) {
      ctx.reply(part)
    }

    const processedMemo = await ctx.reply("⏳ Processing your query...")
    const result = await fetchQuery(transcribedMemo, userID)
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
export default webhookCallback(bot, "https");