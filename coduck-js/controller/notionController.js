import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Client from "@notionhq/client"

// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

// Get the database name from the form
const notionDB = process.env.coduck_notion_board_id

const body = JSON.stringify({ notionDB });

const getCoduckRows = async (
    //   { limit_size = 100 } = {}
) => {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    const response = await notion.dataSources.query({
        data_source_id: process.env.coduck_notion_board_id,
        page_size: limit_size,
    });

    const data = response.results.map((page) => {
        const result = page.properties;
        console.log(JSON.stringify(result, null, 4));
        return {
            id: result.id.title?.[0]?.text?.content ?? "N/A",
            interest_name:
                result.interest_name.rich_text?.[0]?.text?.content ?? "Untitled",
            interest_description:
                result.interest_description.rich_text?.[0]?.text?.content ?? "",
            interest_url: result.interest_url.url ?? "",
            interest_media:
                result.interest_media.files?.map(({ id, ...rest }) => rest.file.url) ?? []
        };
    });

    console.log(data);

    return data;
};


const insertCoduckRows = async () => {

    const token = process.env.NOTION_API_KEY;
    const dataSourceId = notionDB;
    if (!token || !dataSourceId) {
        throw new Error("Set NOTION_API_KEY and NOTION_DATA_SOURCE_ID.");
    }

    const dataSource = await notion.dataSources.retrieve({
        data_source_id: dataSourceId,
    });
    if (!("properties" in dataSource)) {
        throw new Error("The data source response has no schema. Check access.");
    }

    const expectedTypes = {
        "project_task": "string",
        "project_status": "select",
        "project_description": "string",
        "project_name": "title",
       
    };
    for (const [name, type] of Object.entries(expectedTypes)) {
        if (dataSource.properties[name]?.type !== type) {
            throw new Error(`Expected a ${type} property named ${name}. Check the schema.`);
        }
    }

    const page = await notion.pages.create({
        parent: { data_source_id: dataSourceId },
        properties: {
            "Grocery item": { title: [{ text: { content: "Tomatoes" } }] },
            Price: { number: 1.49 },
            "Last ordered": { date: { start: "2026-09-01" } },
        },
    });
    console.log("Created page:", page.id);



}









export { getCoduckRows };