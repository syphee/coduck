from pydantic import BaseModel, Field
from typing import Literal
import subprocess
import json

class TaskItem(BaseModel):
    title: str = Field(description="A specific, actionable subtask — concrete enough to act on immediately")



class ParsedTask(BaseModel):
    intent: Literal["create","update","none"] = Field(
        description=(
            "'create' if this message describes something to track or plan (a task, bookmark, reminder, project idea). "
            "'update' if the message clearly refers to something already in the existing task list (e.g., 'mark X as done', 'I finished the design task', 'rename the research task to...'). Match it to the correct task_id from the list provided—never invent an ID that wasn't given to you. If no existing task matches well, treat it as intent='create' instead. "
            "'none' for greetings, small talk, or general questions that aren't asking to create or track anything."
        )
    )
    project: str | None = Field(
        default=None,
        description="The project this belongs to. Null if intent is 'none'."
    )
    tasks: list[TaskItem] = Field(
        default_factory=list,
        description="One or more concrete subtasks. If the request is broad or high-level, break it down into the real steps an expert would actually take — don't just restate the prompt as a single task. If it's already specific, a single task is fine."
    )
    url: str | None = Field(default=None, description="A URL mentioned in the message, if any")


def validateProject(project_name: str) -> str:
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

def add_task_via_notion_js(parsed) -> dict:
    payload = json.dumps({
        "project": parsed.project,
        "task": parsed.task,
    })

    result = subprocess.run(
        ["node", "notionService.js", payload],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(f"Notion service failed: {result.stderr}")

    return json.loads(result.stdout)