from pydantic import BaseModel, Field

import subprocess
import json


class ParsedTask(BaseModel):
    project: str = Field(description="The project name the task belongs to, e.g. 'HydroGrow'")
    task: str = Field(description="A short, action-oriented description of the task")
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