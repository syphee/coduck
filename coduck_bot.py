import asyncio
from os import getenv
from dotenv import load_dotenv

from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message

from google import genai

load_dotenv()

TOKEN = getenv("coduck_bot")
print(TOKEN)

dp = Dispatcher()

client = genai.Client()

# Command handler
@dp.message(Command("start"))
async def command_start_handler(message: Message) -> None:
    await message.answer("Hello! I'm a bot created with aiogram. Coduck.")

@dp.message()
async def query_handler(message:Message)-> None:
    try:
        # Send a copy of the received message
        print(message.text)
        await message.send_copy(chat_id=message.chat.id)
        
        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input=message.text
        )
        print(interaction.output_text)
        await message.answer(interaction.output_text)
    except TypeError:
        # But not all the types is supported to be copied so need to handle it
        await message.answer("Nice try!")


# Run the bot
async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
          