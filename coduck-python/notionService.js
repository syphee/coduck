const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.CODUCK_NOTION_TOKEN });

const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID;
const TASKS_DB = process.env.NOTION_TASKS_DB_ID;

async function ensureProject(projectName) {
  const result = await notion.databases.query({
    database_id: PROJECTS_DB,
    filter: {
      property: "Name",
      title: { equals: projectName },
    },
  });

  if (result.results.length > 0) {
    return result.results[0].id;
  }

  const page = await notion.pages.create({
    parent: { database_id: PROJECTS_DB },
    properties: {
      Name: { title: [{ text: { content: projectName } }] },
    },
  });

  return page.id;
}

async function addTask(task, projectId) {
  await notion.pages.create({
    parent: { database_id: TASKS_DB },
    properties: {
      Task: { title: [{ text: { content: task } }] },
      Project: { relation: [{ id: projectId }] },
    },
  });
}

async function main() {
  // Read the parsed task JSON from Python via argv
  const input = JSON.parse(process.argv[2]);

  const projectId = await ensureProject(input.project);
  await addTask(input.task, projectId);

  // Send the result back to Python via stdout
  console.log(JSON.stringify({ status: "ok", project_id: projectId }));
}

main().catch((err) => {
  console.error(JSON.stringify({ status: "error", message: err.message }));
  process.exit(1);
});