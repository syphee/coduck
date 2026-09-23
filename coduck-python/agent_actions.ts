import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// The "hub" database that owns the shared data source, and the page
// where newly-created named tables (linked views) should be placed.
const HUB_DATABASE_ID = process.env.NOTION_HUB_DATABASE_ID!;
const NEW_VIEW_PARENT_PAGE_ID = process.env.NOTION_VIEW_PARENT_PAGE_ID!;

// The property used to tag which "table" a row belongs to.
// Must already exist on the data source as a Select property.
const DISCRIMINATOR_PROPERTY = "Table";

let cachedDataSourceId: string | null = null;

/**
 * Resolve (and cache) the shared data source ID that all named tables
 * (views) point to.
 */
async function getDataSourceId(): Promise<string> {
  if (cachedDataSourceId) return cachedDataSourceId;

  const db = await notion.databases.retrieve({ database_id: HUB_DATABASE_ID });
  const dataSources = (db as any).data_sources as { id: string; name: string }[];

  if (!dataSources?.length) {
    throw new Error(`No data sources found on database ${HUB_DATABASE_ID}`);
  }

  // If there's more than one, pick explicitly rather than assume index 0.
  cachedDataSourceId = dataSources[0].id;
  return cachedDataSourceId;
}

/**
 * Find an existing view by name on the shared data source.
 * Falls back to fetching each view individually if the list
 * response doesn't include names inline.
 */
async function findViewByName(
  dataSourceId: string,
  tableName: string
): Promise<{ id: string } | null> {
  const list = await notion.views.list({ data_source_id: dataSourceId });

  for (const ref of list.results as any[]) {
    let name = ref.name;

    if (!name) {
      const full = await notion.views.retrieve({ view_id: ref.id });
      name = (full as any).name;
    }

    if (name?.toLowerCase() === tableName.toLowerCase()) {
      return { id: ref.id };
    }
  }

  return null;
}

/**
 * Create a new named view (table) on the shared data source, filtered
 * to only show rows tagged with this table's discriminator value.
 */
async function createNamedTable(
  dataSourceId: string,
  tableName: string
): Promise<{ id: string }> {
  const view = await notion.views.create({
    create_database: {
      parent: { type: "page_id", page_id: NEW_VIEW_PARENT_PAGE_ID },
    },
    data_source_id: dataSourceId,
    name: tableName,
    type: "table",
    filter: {
      property: DISCRIMINATOR_PROPERTY,
      select: { equals: tableName },
    },
  } as any);

  return { id: (view as any).id };
}

/**
 * Ensure a named table exists (find or create), then insert a row into
 * it by writing to the shared data source with the discriminator tagged.
 */
async function insertIntoTable(
  tableName: string,
  columnValues: Record<string, any>
): Promise<void> {
  const dataSourceId = await getDataSourceId();

  let view = await findViewByName(dataSourceId, tableName);
  if (!view) {
    view = await createNamedTable(dataSourceId, tableName);
    console.log(`Created new table "${tableName}" (view ${view.id})`);
  }

  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId } as any,
    properties: {
      [DISCRIMINATOR_PROPERTY]: { select: { name: tableName } },
      ...columnValues,
    },
  });

  console.log(`Inserted row into "${tableName}"`);
}

// Example usage:
// insertIntoTable("Q3 Leads", {
//   Name: { title: [{ text: { content: "Acme Corp" } }] },
//   Status: { select: { name: "New" } },
// });

export { insertIntoTable };