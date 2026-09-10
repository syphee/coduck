
import json
import traceback

import asyncio
from os import getenv
from dotenv import load_dotenv

from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message

from google import genai

from notionController import ParsedTask,validateProject,add_task_via_notion_js

load_dotenv()

TOKEN = getenv("coduck_bot")
print(TOKEN)

dp = Dispatcher()

client = genai.Client()

# Command handler
@dp.message(Command("start"))
async def command_start_handler(message: Message) -> None:

    await message.answer("Hello! I'm a bot created with aiogram. Coduck.")

def build_notion_properties(parsed: ParsedTask, project_id: str) -> dict:
    return {
        "Task": {
            "title": [{"text": {"content": parsed.task}}]
        },
        "Project": {
            "relation": [{"id": project_id}]
        },
    }


@dp.message()
async def query_handler(message: Message) -> None:
    USER_INPUT = message.text
    print(f"[INPUT] {USER_INPUT!r}")

    try:
        interaction = client.interactions.create(
            model="gemini-3.5-flash-lite",
            input=USER_INPUT,
            system_instruction="You extract task info from messages.",
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": ParsedTask.model_json_schema(),
            },
        )
        print(f"[RAW GEMINI OUTPUT] {interaction.output_text!r}")

        parsed = ParsedTask.model_validate_json(interaction.output_text)
        print(f"[PARSED] {parsed}")

        notion_payload = build_notion_properties(parsed, project_id="TEMP_PLACEHOLDER_ID")
        print("[NOTION PAYLOAD]")
        print(json.dumps(notion_payload, indent=2))

        await message.answer(f"Added '{parsed.task}' to {parsed.project}")

    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        await message.answer(f"[ERROR] {type(e).__name__}: {e}")

        traceback.print_exc()
        

# @dp.message()
# async def query_handler(message: Message) -> None:
#     USER_INPUT = message.text
#     print(f"[INPUT] {USER_INPUT!r}")

#     try:
#         interaction = client.interactions.create(
#             model="gemini-3.8-flash",
#             input=USER_INPUT,
#             system_instruction="You extract task info from messages.",
#             response_format={
#                 "type": "text",
#                 "mime_type": "application/json",
#                 "schema": ParsedTask.model_json_schema(),
#             },
#         )
#         print(f"[RAW GEMINI OUTPUT] {interaction.output_text!r}")

#         parsed = ParsedTask.model_validate_json(interaction.output_text)
#         print(f"[PARSED] {parsed}")

#         # ← Notion lookup-or-create AND the insert now both happen inside notion_service.js
#         notion_result = add_task_via_notion_js(parsed)
#         print(f"[NOTION RESULT] {notion_result}")

#         await message.answer(f"Added '{parsed.task}' to {parsed.project}")

#     except Exception as e:
#         print(f"[ERROR] {type(e).__name__}: {e}")
#         traceback.print_exc()
#         await message.answer("Nice try!")


# Run the bot
async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
          