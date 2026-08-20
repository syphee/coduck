# MVP — Corrections Applied

Two things in the original draft conflict with decisions already made for this project, so I corrected them throughout:

1. **LLM: OpenAI/Claude → Gemini 2.5 Flash.** You're using Gemini's cloud API, not OpenAI or Claude.
2. **MCP → direct Notion SDK.** Your task sequence is fixed (classify → lookup → create → insert), which doesn't benefit from MCP's dynamic tool-discovery layer. The official `notion-client` Python SDK does the same job with one less subprocess/protocol layer to debug. `mcp_client.py` and the "MCP Service" section are removed; everything lives in `notion_service.py` as your folder structure already implied.

Everything else — the relational Projects/Tasks schema, the milestone structure, the example flow — is unchanged and carries over as-is.

---

## MVP Architecture

```text
Telegram Bot
      │
      ▼
Python (FastAPI + aiogram)
      │
      ▼
Gemini 2.5 Flash
(Intent + Entity Extraction, structured JSON output)
      │
      ▼
notion_service.py
(notion-client SDK, direct API calls)
      │
      ▼
Projects DB
Tasks DB
```

---

## Folder Structure

```text
clipboard-agent/
│
├── app.py
├── config.py
├── parser.py
├── notion_service.py
├── telegram_bot.py
│
├── prompts/
│   └── system.txt
│
├── models/
│   ├── task.py
│   └── project.py
│
├── requirements.txt
│
└── .env
```

`mcp_client.py` removed — `notion_service.py` calls the Notion API directly.

---

## requirements.txt

```txt
aiogram
google-genai
notion-client
python-dotenv
pydantic
```

`openai` and `mcp` removed. `google-genai` is Google's official Python SDK for Gemini. `notion-client` is the official Notion SDK, replacing the MCP server dependency.

---

## Data Model

```python
from pydantic import BaseModel

class ParsedTask(BaseModel):
    intent: str
    project: str
    task: str
```

Unchanged.

---

## Example Prompt

```
You are an inbox parser.

Extract:

intent
project
task

Example

Input:

Add draft design to HydroGrow

Output

{
  "intent":"create_task",
  "project":"HydroGrow",
  "task":"Draft design"
}

Return JSON only.
```

Unchanged — same prompt works with Gemini.

---

## parser.py

```python
from google import genai
from models.task import ParsedTask
import json
import os

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

SYSTEM = open("prompts/system.txt").read()

def parse(text: str) -> ParsedTask:

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=text,
        config={
            "system_instruction": SYSTEM,
            "response_mime_type": "application/json",
        },
    )

    data = json.loads(response.text)

    return ParsedTask(**data)
```

Key differences from the original: uses `google-genai`'s client instead of OpenAI's, and uses Gemini's native `response_mime_type: "application/json"` config for structured output instead of relying on prompt instructions alone — this makes malformed JSON far less likely than "Return JSON only" as a prompt hint.

---

## notion_service.py

```python
from notion_client import Client
import os

notion = Client(auth=os.environ["NOTION_TOKEN"])

PROJECTS_DB = os.environ["NOTION_PROJECTS_DB_ID"]
TASKS_DB = os.environ["NOTION_TASKS_DB_ID"]


def ensure_project(project_name: str) -> str:

    result = notion.databases.query(
        database_id=PROJECTS_DB,
        filter={
            "property": "Name",
            "title": {"equals": project_name},
        },
    )

    if result["results"]:
        return result["results"][0]["id"]

    page = notion.pages.create(
        parent={"database_id": PROJECTS_DB},
        properties={
            "Name": {"title": [{"text": {"content": project_name}}]}
        },
    )

    return page["id"]


def add_task(parsed):

    project_id = ensure_project(parsed.project)

    notion.pages.create(
        parent={"database_id": TASKS_DB},
        properties={
            "Task": {"title": [{"text": {"content": parsed.task}}]},
            "Project": {"relation": [{"id": project_id}]},
        },
    )
```

This replaces both the "MCP Service" and "Task Creation" sections from the original — same logic (query-or-create, then create-with-relation), but calling the Notion API directly via `notion-client` instead of going through an MCP server process. Note the `notion-client` SDK is synchronous by default; if you want this non-blocking inside `aiogram`'s async handlers, wrap calls with `asyncio.to_thread(...)` or use `AsyncClient` from `notion_client`.

---

## Telegram Handler

```python
@router.message()
async def handle(message):

    parsed = parse(message.text)

    add_task(parsed)

    await message.answer(
        f"Added '{parsed.task}' to {parsed.project}"
    )
```

Same structure as the original. Note `parse()` and `add_task()` are synchronous calls here — fine for an MVP, but if you hit noticeable lag under real use, move them to a thread pool so they don't block the bot's event loop.

---

## Example Flow

User sends

```
Need landing page mockups for HydroGrow
```

↓

Gemini returns

```json
{
  "intent":"create_task",
  "project":"HydroGrow",
  "task":"Landing page mockups"
}
```

↓

notion_service.py

```
Query Projects DB

HydroGrow exists?

No
```

↓

Create

```
Project

HydroGrow
```

↓

Create

```
Task

Landing page mockups

Relation:
HydroGrow
```

↓

Telegram

```
✅ Added task

Project:
HydroGrow

Task:
Landing page mockups
```

---

## MVP Sequence Diagram

```text
Telegram
    │
    │ "Need landing page"
    ▼
Python Bot
    │
    ▼
Gemini 2.5 Flash
    │
    ▼
{
 project,
 task
}
    │
    ▼
Query Notion (notion-client)
    │
Project exists?
   │
 ┌─┴──────┐
 │No      │Yes
 ▼        ▼
Create    Return ID
Project
     │
     ▼
Create Task
     │
     ▼
Telegram Reply
```

---

## Suggested Milestones

| Milestone | Goal                           | Success Criteria                                                                   |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| M0        | Telegram bot receives messages | Bot echoes user input                                                              |
| M1        | LLM parsing                    | Gemini returns structured JSON with `intent`, `project`, and `task`                |
| M2        | Notion connection               | Can query and create pages in Notion via `notion-client`                          |
| M3        | Project lookup                 | Existing projects are reused                                                       |
| M4        | Task creation                  | Related task appears under the correct project                                     |
| M5        | End-to-end flow                | Sending a Telegram message creates a linked Notion task and returns a confirmation |

Unchanged from the original — the milestones don't depend on which LLM or Notion integration method you use.

### Example interaction

Input:

```
Create project HydroGrow and add task Design irrigation dashboard
```

Result:

1. Gemini extracts:

   * Intent: `create_project_and_task`
   * Project: `HydroGrow`
   * Task: `Design irrigation dashboard`
2. The application checks whether `HydroGrow` exists in the Projects database (via `notion-client`, not MCP).
3. If it doesn't exist, it creates the project.
4. It creates the task and links it to the project via the Notion relation property.
5. The bot replies:

```
✅ Done!

Project: HydroGrow
Task: Design irrigation dashboard
Status: Todo
```

---

## One thing to double check

You'll need a `NOTION_TOKEN`, `NOTION_PROJECTS_DB_ID`, `NOTION_TASKS_DB_ID`, and `GEMINI_API_KEY` in your `.env` file — the original draft's code didn't show env var loading explicitly. Also worth confirming: this MVP uses the relational Projects/Tasks schema, which is a valid choice, but note it's more setup than the flat single-database schema discussed earlier in this project's plan. Worth sticking with your call here, just flagging it's not the "simpler" option if you were leaning that way.