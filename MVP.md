## MVP Architecture

```text
Telegram Bot
      │
      ▼
Python (FastAPI + aiogram)
      │
      ▼
OpenAI / Claude
(Intent + Entity Extraction)
      │
      ▼
MCP Client
      │
      ▼
Notion MCP Server
      │
      ▼
Projects DB
Tasks DB
```

---

# Folder Structure

```text
clipboard-agent/
│
├── app.py
├── config.py
├── parser.py
├── notion_service.py
├── telegram_bot.py
├── mcp_client.py
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

---

# requirements.txt

```txt
aiogram
openai
python-dotenv
mcp
pydantic
```

---

# Data Model

```python
from pydantic import BaseModel

class ParsedTask(BaseModel):
    intent: str
    project: str
    task: str
```

---

# Example Prompt

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

---

# parser.py

```python
from openai import OpenAI
from models.task import ParsedTask
import json

client = OpenAI()

SYSTEM = open("prompts/system.txt").read()

def parse(text):

    response = client.responses.create(
        model="gpt-4.1",
        input=[
            {"role":"system","content":SYSTEM},
            {"role":"user","content":text}
        ]
    )

    data = json.loads(response.output_text)

    return ParsedTask(**data)
```

---

# MCP Service

```python
async def ensure_project(project_name):

    result = await notion.query_database(
        database="Projects",
        filter={
            "property":"Name",
            "title":{
                "equals":project_name
            }
        }
    )

    if result:

        return result[0]["id"]

    page = await notion.create_page(
        database="Projects",
        properties={
            "Name":project_name
        }
    )

    return page["id"]
```

---

# Task Creation

```python
async def add_task(parsed):

    project_id = await ensure_project(parsed.project)

    await notion.create_page(
        database="Tasks",
        properties={
            "Task":parsed.task,
            "Project":[project_id]
        }
    )
```

---

# Telegram Handler

```python
@router.message()

async def handle(message):

    parsed = parse(message.text)

    await add_task(parsed)

    await message.answer(
        f"Added '{parsed.task}' to {parsed.project}"
    )
```

---

# Example Flow

User sends

```
Need landing page mockups for HydroGrow
```

↓

LLM returns

```json
{
  "intent":"create_task",
  "project":"HydroGrow",
  "task":"Landing page mockups"
}
```

↓

MCP

```
Search Project

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

# MVP Sequence Diagram

```text
Telegram
    │
    │ "Need landing page"
    ▼
Python Bot
    │
    ▼
GPT
    │
    ▼
{
 project,
 task
}
    │
    ▼
Query Notion
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

# Suggested Milestones

| Milestone | Goal                           | Success Criteria                                                                   |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| M0        | Telegram bot receives messages | Bot echoes user input                                                              |
| M1        | LLM parsing                    | Structured JSON with `intent`, `project`, and `task`                               |
| M2        | MCP connection                 | Can query and create pages in Notion                                               |
| M3        | Project lookup                 | Existing projects are reused                                                       |
| M4        | Task creation                  | Related task appears under the correct project                                     |
| M5        | End-to-end flow                | Sending a Telegram message creates a linked Notion task and returns a confirmation |

### Example interaction

Input:

```
Create project HydroGrow and add task Design irrigation dashboard
```

Result:

1. LLM extracts:

   * Intent: `create_project_and_task`
   * Project: `HydroGrow`
   * Task: `Design irrigation dashboard`
2. The application checks whether `HydroGrow` exists in the Projects database.
3. If it doesn't exist, it creates the project.
4. It creates the task and links it to the project via the Notion relation property.
5. The bot replies:

```
✅ Done!

Project: HydroGrow
Task: Design irrigation dashboard
Status: Todo
```
