// to run npx tsc everytime..

import { Bot, webhookCallback, InlineKeyboard, session, type SessionFlavor, type Context } from "grammy";
import { Menu, MenuRange } from "@grammyjs/menu";

import dotenv from "dotenv";
import * as path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const coduck_key: string = process.env.coduck_bot!;
const gemini_key: string = process.env.GEMINI_API_KEY!;

// to store generated response, if to reject or to add

interface taskData {
  generatedResult: object | null,
  userInput: string | null,
}

type coduckContext = Context & SessionFlavor<taskData>;


const bot = new Bot<coduckContext>(coduck_key);




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
]).catch((error) => {
  console.error("[CODUCK_BOT:SET_COMMANDS_ERROR]", error);
});


// to setup user's chosen table for tasks insertion
// should launch after doing /notion
// will prompt user for database id
// this will only work, and should only work when user has already logged into
// notion. 

// // will add a "choose table" command once i settle this backbone
// bot.command("setup", (ctx) => {

// });

// to make user login into their notion account so they can do /setup
// redirects user to login notion, to make user login, set token
// into neon.
//
// neon will contain tele user id, notion user token, and database id
// callback will be t.me after logon

// to check if current user is already linked to notion, otherwise bring out URL
// telegram users will have to call /notion first inorder to get access to their
// tables

bot.command("notion", async (ctx) => {
  try {
    const userID = ctx.from?.id
    // register userID into notion first
    const userExists = await fetch(`${process.env.CODUCK_API_URL}/api/auth/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userID,
      }),

      // rookie moment here totally did not spend an hour
    }).then((res) => {
      return res.json()

      // 3 years of diploma experience gone
      // to research when to use async
    }).then((data) => {
      // if not linked yet
      return data

    });

    console.log(`linked? ${userExists.linked}`)

    // first time setup / no workspaces linked yet
    if (!userExists.linked) {
      const notionAuthURL = `${process.env.NOTION_OAUTH_URL}`
      const notionOAuthLinkParams = `${notionAuthURL}&state=telegram:${userID}`
      const keyboard = new InlineKeyboard().url("Link Notion", notionOAuthLinkParams);

      await ctx.reply(
        "Click the button below to set up your Notion account!",
        { reply_markup: keyboard }
      );

      // if already linked / has existing workspaces
    } else if (userExists.linked) {
      //TODO setup of JWT
      const getUserSources = await fetch(`${process.env.CODUCK_API_URL}/api/data/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: userID,
        }),
      });
      const getUserActiveSource = await fetch(`${process.env.CODUCK_API_URL}/api/auth/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: userID,
          platform: 'telegram'
        }),
      });

      const userSources = await getUserSources.json();
      const userActiveSource = await getUserActiveSource.json();

      // to add "Unlink Notion btn"

      // or maybe add an interface to allow user to switch between
      // workspaces
      // and add an unlink btn..
      // this proj is getting way too complicated for a simple one
      const notionAuthURL = `${process.env.NOTION_OAUTH_URL}`
      const notionOAuthLinkParams = `${notionAuthURL}&state=telegram:${userID}`

      const btns = new InlineKeyboard()
        .url("Add Notion Source", notionOAuthLinkParams)
        .row()
        .url("Remove Notion Source", "www.google.com")
        .row()
        .text("Select Source", "select-notion-source")

      //to check if there is even a board selected, else return just added sources
      let textOutput = '';

      if (!userActiveSource) {
        // all these trouble just to get the name of the board...

        const matchedVal = userActiveSource.data[0].active_notion_database_id
        const activeSource = userSources.data
          .find((item) =>
            item.data_source_id === matchedVal)
        const output = activeSource.data_source_name

        textOutput += `
      [Selected Source]
      ${output ? output : 'None'}
      `
      } else {

        // display all added boards linked to account
        textOutput += `\n\n[Linked Sources]
      ${userSources.data.map((item, index) => {
          return `${index + 1} - ${item.data_source_name}\n\n`
        })}
      `
      }

      await ctx.reply(
        `${textOutput}`,
        { reply_markup: btns }
      );

    }

    return
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Error initialization. Try again.");
  }
});



const notionSourceMenu = new Menu("dynamic")
  .dynamic(async (ctx, range) => {

    const userID = ctx.from?.id;

    const response = await fetch(
      `${process.env.CODUCK_API_URL}/api/data/sources`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: userID,
          platform: 'telegram'
        }),
      }
    );

    const userSources = await response.json();

    userSources?.data?.forEach((item) => {

      range
        .text(item.data_source_name, async (ctx) => {

          // // Update active datasource
          // ACTIVE_DATASOURCE[0] = {
          //   user_access_token: item.user_access_token,
          //   data_source_id: item.data_source_id,
          //   data_source_name: item.data_source_name,
          // };

          const response = await fetch(
            `${process.env.CODUCK_API_URL}/api/auth/sources/select`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userID: userID,
                dataSourceId: item.data_source_id,
                platform: 'telegram'
              }),
            }
          );

          const selectedSource = await response.json();

          if (selectedSource.status == "success") {
            await ctx.editMessageText(
              `${item.data_source_name} board is now active!`,
              { reply_markup: new InlineKeyboard()  }
            );
          } else if (selectedSource.status == "failed") {
            await ctx.reply(
              `❌ Couldn't select source. Reason : ${selectedSource.reason}`
            );
          }

        })
        .row();

    });

  })
  .text("Cancel", async (ctx) => {
    await ctx.deleteMessage();
  });

bot.use(notionSourceMenu);


bot.callbackQuery("select-notion-source", async (ctx) => {

  await ctx.answerCallbackQuery();

  await ctx.editMessageText(
    "Select your Notion source:",
    {
      reply_markup: notionSourceMenu,
    }
  );

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

const resetQuery = async (userID) => {
  const API_URL = process.env.CODUCK_API_URL || "http://localhost:3000";

  const response = await fetch(`${API_URL}/api/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID: userID }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
};

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

// Normal Message Query
const fetchQuery = async (query, userID, platform) => {
  console.log(`[QUERY]:${query}\n`);
  const API_URL = process.env.CODUCK_API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: query,
        userID: userID,
        platform: platform
      }),
    });

    console.log(`[RESPONSE]:${JSON.stringify(response)}\n`);

    if (!response.ok) {
      console.log(`[ERROR]:${response.status} - ${response.statusText}\n`);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error(`[ERROR]:${error}\n`);
    throw error;
  }
};

const fetchVoiceQuery = async (voiceQuery, userID, mimeType = "audio/ogg") => {
  const formData = new FormData();
  const voiceMemo = new Blob([voiceQuery], { type: mimeType });
  formData.append("voiceMemo", voiceMemo, "telegram_voice_prompt.ogg");
  formData.append("userID", String(userID));

  const API_URL = process.env.CODUCK_API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`API returned ${response.status}: ${details}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error(`[ERROR]:${error}\n`);
    throw error;
  }
}

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



    //main processing
    const processedMemo = await ctx.reply("⏳ Processing your query...")
    const result = await fetchQuery(transcript, userID, 'telegram')
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


bot.use(session({
  initial: (): taskData => ({
    generatedResult: null,
    userInput: null
  })
}))


bot.callbackQuery("reject-generated-response", async (ctx) => {

  await ctx.answerCallbackQuery();

  await ctx.deleteMessage();
  await ctx.reply("❌ Query cancelled.");

});

// bot.callbackQuery("regenerate-response", async (ctx) => {

//   await ctx.answerCallbackQuery();

//   await ctx.reply(

//   );

// });

bot.callbackQuery("insert-generated-response", async (ctx) => {
  try {

    //TODO  
    // to cleanup this auth portion
    const userID = ctx.chat.id

    const getUserActiveSource = await fetch(`${process.env.CODUCK_API_URL}/api/auth/source`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userID: userID,
        platform: 'telegram'
      }),
    });

    const auth = await getUserActiveSource.json()

    const payload = ctx.session.generatedResult;

    const response = await fetch(`${process.env.CODUCK_API_URL}/api/coduck-notion/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskPayload: payload,
        auth: auth
      }),
    });

    const selectedSource = await response.json();

    await ctx.answerCallbackQuery();
    await ctx.deleteMessage();

    if (selectedSource.status === "success") {
      await ctx.reply(`${selectedSource.data}`);
    }
    if (selectedSource.status === "fail") {
      await ctx.reply(`Task was not added. Please try again with a new prompt.`);
    }
  } catch (err) {
    await ctx.reply("❌ Sorry, something went wrong while processing that.");
    console.log(`[coduck_bot insert-generated-response Notion Insertion ERROR]: ${err}`)
  }

});


bot.callbackQuery("regenerate-response", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();

  const loadingText = await ctx.reply("⏳ Regenerating query...");
  try {

    const userInput = ctx.session.userInput
    const userID = ctx.from.id
    if (!userInput) {
      return;
    }


    const result = await fetchQuery(userInput, userID, 'telegram');
    // then store in session storage temporarily
    ctx.session.generatedResult = result
    ctx.session.userInput = userInput

    const queryData = result.formattedResult
    const queryDataMessage = result.formattedResultText

    // if is taskQuery
    let btns;
    if (queryData && queryDataMessage) {
      btns = new InlineKeyboard()
        .text("Cancel", "reject-generated-response")
        .row()
        .text("Add to Board", "insert-generated-response")
        .row()
        .text("Regenerate prompt", "regenerate-response")

      ctx.session.generatedResult = queryData
      ctx.session.userInput = userInput

      // to add a add/cancel/regenerate/edit btn
      await ctx.api.editMessageText(
        ctx.chat.id,
        loadingText.message_id,
        String(queryDataMessage),
        { reply_markup: btns }
      );
    }
    //if generalQuery
    else {
      // to add a add/cancel/regenerate/edit btn
      const generalQueryMessage = result

      await ctx.api.editMessageText(
        ctx.chat.id,
        loadingText.message_id,
        String(generalQueryMessage),
      );
    }


  } catch (error) {
    console.error(error);
    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingText.message_id,
      "❌ Sorry, something went wrong while processing that."
    );
  }

});


// Normal message handler
// to add auth for notion, to notify user that input is not being saved
// unless notion is linked
bot.on("message", async (ctx) => {
  const loadingText = await ctx.reply("⏳ Processing your message...");
  try {

    const userInput = ctx.message?.text;
    const userID = ctx.from.id
    if (!userInput) {
      return;
    }


    const result = await fetchQuery(userInput, userID, 'telegram');
    // then store in session storage temporarily
    const queryData = result.formattedResult
    const queryDataMessage = result.formattedResultText

    // if is taskQuery
    let btns;
    if (queryData && queryDataMessage) {
      btns = new InlineKeyboard()
        .text("Cancel", "reject-generated-response")
        .row()
        .text("Add to Board", "insert-generated-response")
        .row()
        .text("Regenerate prompt", "regenerate-response")

      ctx.session.generatedResult = queryData
      ctx.session.userInput = userInput

      // to add a add/cancel/regenerate/edit btn
      await ctx.api.editMessageText(
        ctx.chat.id,
        loadingText.message_id,
        String(queryDataMessage),
        { reply_markup: btns }
      );
    }
    //if generalQuery
    else {
      // to add a add/cancel/regenerate/edit btn
      const generalQueryMessage = result

      await ctx.api.editMessageText(
        ctx.chat.id,
        loadingText.message_id,
        String(generalQueryMessage),
      );
    }




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
//export default webhookCallback(bot, "https", {
// timeoutMilliseconds: 50_000,
//});

export default webhookCallback(bot, "https", {
  timeoutMilliseconds: 50_000,
  onTimeout: "return"
});