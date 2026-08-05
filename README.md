# 🤖 Omnichannel AI Clipboard Agent

## Executive Summary

A frictionless, voice- and text-driven personal knowledge ingestion pipeline. This agent allows you to dump messy, unstructured thoughts, voice notes, and web links into your daily communication apps (**Telegram, WhatsApp, and Discord**). It utilizes the **Model Context Protocol (MCP)** to parse, enrich, summarize, and dynamically organize your data into dedicated project contexts within a centralized **Notion Kanban Dashboard**.

---

# 🏗️ Architecture & Ecosystem

```text
┌────────────────────────────────────────────────────────────────┐
│                          INPUT CACHING                         │
│   ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│   │   Telegram Bot   │  │   WhatsApp Text  │  │ Discord Bot │  │
│   └────────┬─────────┘  └────────┬─────────┘  └──────┬──────┘  │
└────────────┼─────────────────────┼───────────────────┼─────────┘
             └─────────────────────┼───────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                    CENTRAL APPLICATION HOST                    │
│      Python Backend Core (`aiogram` / `mcp` Client SDK)        │
└────────────────────────────────────────────────────────────────┘
                                   │ (Context Loop)
                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT ROUTING LAYER                   │
│             Anthropic Claude 3.5 / OpenAI GPT-4o               │
└────────────────────────────────────────────────────────────────┘
                                   │ (Structured Tool Execution)
                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                     LOCAL MCP SERVER POOL                      │
│      ┌───────────────────────────┐   ┌──────────────────────┐  │
│      │     Notion MCP Server     │   │  Puppeteer/Fetch MCP │  │
│      └─────────────┬─────────────┘   └──────────┬───────────┘  │
└────────────────────┼────────────────────────────┼──────────────┘
                     │ (Relational Updates)       │ (Web Scraping)
                     ▼                            ▼
┌────────────────────────────────────────────────────────────────┐
│                       NOTION WORKSPACE                         │
│  ┌───────────────────────────────┐   ┌──────────────────────┐  │
│  │    Master Projects Index      │──►│ Master Kanban Tasks  │  │
│  │ (Dynamically Generated Tabs)  │   │ (Filtered Relational)│  │
│  └───────────────────────────────┘   └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

- **Frontend UI Gateways:** Telegram Bot API (aiogram), Discord Client API (discord.py), and WhatsApp raw log parsers.
- **Core Agent Runtime:** Python 3.11+ using the official Python MCP asynchronous client SDK.
- **Brain Engine:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o (optimized for native JSON-schema tool manipulation).
- **Data Integration Layer:** `server-notion` (Official community MCP server running over Node/npx).
- **Enrichment Tooling:** Puppeteer headless browser MCP server for extracting dark text contexts from unstructured text links.

---

# 🔄 Dynamic Ingestion Flow

## 1. The Dump

You send a message or drop a link into your app of choice:

> *"Add draft design to a new project called HydroGrow"*

---

## 2. Entity Recognition & Extraction

The AI Brain isolates:

- **Intent:** Create Project + Add Task
- **Project Context:** HydroGrow
- **Action Item:** Draft design

---

## 3. Database Discovery Loop

- The agent searches the **Master Projects Index** via the Notion MCP Server.
- If **HydroGrow** does not exist, a new relational parent row is automatically instantiated.
- If it exists, the agent retrieves its unique Notion Page ID.

---

## 4. Relational Entry Injection

The agent calls `notion_create_database_page` to insert the task card inside the **Master Kanban Tasks** table, explicitly passing the Parent Project ID into the relational property field.

---

## 5. Dashboard Rendering

Your Notion workspace reflects a fresh Kanban task nested cleanly inside its corresponding project filter tab.

---

# 📉 Waterfall Development Roadmap

The system development follows a strict dependencies waterfall workflow. Each milestone must pass its specified exit validation criteria before proceeding to the next.

```text
[M1: Database & Token Setup] ──────┐
                                   ▼
                       [M2: Core MCP Handshake] ──────┐
                                                      ▼
                                          [M3: Relational Logic] ──────┐
                                                                       ▼
                                                           [M4: Omnichannel Connectors] ──────┐
                                                                                              ▼
                                                                                   [M5: Backlog Migration] ──────┐
                                                                                                                 ▼
                                                                                                      [M6: Cloud Deployment]
```

---

## Milestone 1: Tokens & Relational Databases (Days 1–2)

### Tasks

- Create the **Master Projects** parent database in Notion.
- Create the **Master Kanban Tasks** child database.
- Add a Relation property linking the Tasks database to the Projects database.
- Provision Developer Access tokens across Telegram, Discord, and Notion.

### Exit Gate

Notion Integration is manually bound as a connection to both schemas, and database IDs are securely logged.

---

## Milestone 2: Core MCP Client Handshake (Days 3–4)

### Tasks

- Establish a local Node/Python developer workspace with the official MCP SDK.
- Initialize the pre-built `@modelcontextprotocol/server-notion` via an internal pipeline process.
- Write a basic test client (`test_mcp.py`) to connect via standard I/O streams.

### Exit Gate

Execution logs successfully print discovered server tools and run a non-relational test page creation entry inside the workspace.

---

## Milestone 3: Dynamic Relational Intelligence (Days 5–7)

### Tasks

- Program the conditional project query tool loop.
- Implement the fallback creation engine that executes when a lookup queries zero results.
- Create the execution pipeline that grabs parent page references and passes them inside relational child objects.

### Exit Gate

Executing the script with a novel project string cleanly populates both tables with an explicit structural database reference bond.

---

## Milestone 4: Omnichannel Client Integrations (Days 8–11)

### Tasks

- Implement the background message loop listeners (aiogram for Telegram and `discord.py` for Discord).
- Build the context parser hooks for parsing raw text and scraping media URLs.
- Wire up the chosen large language model tool-calling interface (Claude 3.5 or GPT-4o) using the local system prompt definitions.

### Exit Gate

Live text strings sent into a Telegram chat window or Discord channel trigger the agent to intelligently classify context fields, execute structural tool actions, and ping back a confirmation message.

---

## Milestone 5: Historical Backlog Migration (Days 12–13)

### Tasks

- Collect raw chat data dumps (Telegram JSON exports, WhatsApp structural TXT files, and Discord JSON tables).
- Run local regex parsing utilities to isolate links and historical note paragraphs.
- Implement a throttled execution runner that pushes the master backlog array into the tool ingestion loop while applying origin application source badges.

### Exit Gate

Your backlog is successfully absorbed, transforming raw message files into chronologically sorted Kanban cards across your distinct project dashboard tabs.

---

## Milestone 6: Live Production Deployment (Day 14)

### Tasks

- Package the Python service files and the running Node runtime together using a multi-stage Dockerfile.
- Deploy the application image to a dedicated cloud virtual private server (VPS).
- Set up system process monitoring logs to manage persistent webhook states.

### Exit Gate

The application runs fully detached, offering sub-second omnichannel processing directly from mobile and desktop endpoints.

---

### 🛠️ Execution Checklist

### Phase 1: Environment & Token Provisioning

* [ ] Create **Master Projects** Database in Notion.
* [ ] Create **Master Kanban Tasks** Database in Notion.
* [ ] Establish a Relation field from the Tasks database to the Projects database.
* [ ] Generate an Internal Integration Token (ntn_...) via the Notion Developer Portal.
* [ ] Link the Internal Integration to both Notion databases using the connections menu in the UI.
* [ ] Register a new bot via Telegram's @BotFather and securely save the HTTP API Token.
* [ ] Create a Discord application in the developer portal and acquire a Bot Token.

### Phase 2: Local MCP Core Setup

* [ ] Install Node.js runtime and Python 3.11+ on your local development machine.
* [ ] Verify local library accessibility by running npx -y @modelcontextprotocol/server-notion.
* [ ] Initialize a local Python virtual environment and run pip install mcp.
* [ ] Code a local handshake verification script (test_mcp.py) to handle standard I/O stream connections.
* [ ] Successfully fetch and log available tools (such as notion_create_database_page and notion_query_database).

### Phase 3: Relational Tool Construction

* [ ] Construct JSON query parameters to find identical title properties inside the Projects database.
* [ ] Implement search evaluation logic to parse unique Notion Page IDs from matching queries.
* [ ] Write a fallback creation block that triggers a page creation tool when a project lookup yields zero results.
* [ ] Package your target project's structural reference ID into the secondary task insertion payload.
* [ ] Verify the execution by calling the Python runner to inject a brand-new project parent tab and its nested task simultaneously.

### Phase 4: Chat Integrations & Brain Config

* [ ] Build an asynchronous background listener loop for incoming Telegram text using Python's aiogram framework.
* [ ] Build a parallel message listener hook for Discord text channels using discord.py.
* [ ] Provide strict system prompt instructions to your target LLM (Claude or OpenAI) for schema entity classification.
* [ ] Map successful tool output payloads to outbound chat confirmation dispatch cards.

### Phase 5: Historical Migrations

* [ ] Export raw chat logs in a JSON structure (result.json) using the Telegram Desktop client.
* [ ] Pull WhatsApp structural conversation files (.txt) via the mobile app settings panels.
* [ ] Fetch historical text channel datasets in a JSON format using the DiscordChatExporter tool.
* [ ] Run regular expression extraction scripts to strip away unneeded message metadata blocks.
* [ ] Run a throttled execution queue to feed items sequentially while applying origin platform system badges.

### Phase 6: Server Deployment

* [ ] Package your Python application code and the running Node runtime inside a multi-stage Dockerfile.
* [ ] Provision a lightweight virtual private server (VPS) instance.
* [ ] Push local application configurations and Docker environment setups to your remote host.
* [ ] Activate detached background system workers to monitor your continuous messaging pipelines 24/7.