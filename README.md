### 🤖 Omnichannel AI Clipboard Agent

A frictionless, voice- and text-driven personal knowledge ingestion pipeline. This agent allows you to dump messy, unstructured thoughts, voice notes, and web links into your daily communication apps (**Telegram, WhatsApp, and Discord**). It utilizes the **Model Context Protocol (MCP)** to parse, enrich, summarize, and dynamically organize your data into dedicated project contexts within a centralized **Notion Kanban Dashboard**. 

### 🏗️ Architecture & Ecosystem

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
│  │    Master Projects Index     │ ──►│ Master Kanban Tasks  │  │
│  │ (Dynamically Generated Tabs)  │   │  (Filtered Relational│  │
│  └───────────────────────────────┘   └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

### 🛠️ Technology Stack

* **Frontend UI Gateways:** Telegram Bot API (aiogram), Discord Client API (discord.py), and WhatsApp raw log parsers.
* **Core Agent Runtime:** Python 3.11+ using the official Python mcp asynchronous client SDK.
* **Brain Engine:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o (optimized for native json-schema tool manipulation).
* **Data Integration Layer:** server-notion (Official community MCP server running over Node/npx).
* **Enrichment Tooling:** puppeteer headless browser MCP server for extracting dark text contexts from unstructured text links.

### 🔄 Dynamic Ingestion Flow

1. **The Dump:** You send a message or drop a link into your app of choice: 

*"Add draft design to a new project called HydroGrow"*
2. **Entity Recognition & Extraction:** The AI Brain isolates the **Intent** (Create Project + Add Task), the **Project Context** (HydroGrow), and the **Action Item** (draft design).
3. **Database Discovery Loop:** 

  * The agent searches the **Master Projects Index** via the Notion MCP Server.
  * If HydroGrow does not exist, a new relational parent row is automatically instantiated.
  * If it exists, the agent retrieves its unique Notion Page ID.
4. **Relational Entry Injection:** The agent calls notion_create_database_page to insert the task card inside the **Master Kanban Tasks** table, explicitly passing the Parent Project ID into the relational property field.
5. **Dashboard Rendering:** Your Notion workspace reflects a fresh Kanban task nested cleanly inside its corresponding project filter tab.

### 📉 Waterfall Development Roadmap

The system development follows a strict dependencies waterfall workflow. Each milestone must pass its specified exit validation criteria before proceeding to the next. 

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

### Milestone 1: Tokens & Relational Databases (Days 1-2)

* **Tasks:** 

  * Create the **Master Projects** parent database in Notion.
  * Create the **Master Kanban Tasks** child database.
  * Add a Relation property linking the tasks database to the projects database.
  * Provision Developer Access tokens across Telegram, Discord, and Notion.
* **Exit Gate:** Notion Integration is manually bound as a connection to both schemas, and database IDs are securely logged.

### Milestone 2: Core MCP Client Handshake (Days 3-4)

* **Tasks:** 

  * Establish a local Node/Python developer workspace with the official mcp SDK.
  * Initialize the pre-built @modelcontextprotocol/server-notion via an internal pipeline process.
  * Write a basic test client (test_mcp.py) to connect via standard I/O streams.
* **Exit Gate:** Execution logs successfully print discovered server tools and run a non-relational test page creation entry inside the workspace.

### Milestone 3: Dynamic Relational Intelligence (Days 5-7)

* **Tasks:** 

  * Program the conditional project query tool loop.
  * Implement the fallback creation engine that executes when a lookup queries zero results.
  * Create the execution pipeline that grabs parent page references and passes them inside relational child objects.
* **Exit Gate:** Executing the script with a novel project string cleanly populates both tables with an explicit structural database reference bond.

### Milestone 4: Omnichannel Client Integrations (Days 8-11)

* **Tasks:** 

  * Implement the background message loop listeners (aiogram for Telegram and discord.py for Discord).
  * Build the context parser hooks for parsing raw text and scraping media URLs.
  * Wire up the chosen large language model tool-calling interface (Claude 3.5 or GPT-4o) using the local system prompt definitions.
* **Exit Gate:** Live text strings sent into a Telegram chat window or Discord channel trigger the agent to intelligently classify context fields, execute structural tool actions, and ping back a confirmation message.

### Milestone 5: Historical Backlog Migration (Days 12-13)

* **Tasks:** 

  * Collect raw chat data dumps (Telegram JSON exports, WhatsApp structural TXT files, and Discord JSON tables).
  * Run local regex parsing utilities to isolate links and historical note paragraphs.
  * Implement a throttled execution runner that pushes the master backlog array into the tool ingestion loop while applying origin application source badges.
* **Exit Gate:** Your backlog is successfully absorbed, transforming raw message files into chronologically sorted Kanban cards across your distinct project dashboard tabs.

### Milestone 6: Live Production Deployment (Day 14)

* **Tasks:** 

  * Package the Python service files and the running Node runtime together using a multi-stage Dockerfile.
  * Deploy the application image to a dedicated cloud virtual private server (VPS).
  * Set up system process monitoring logs to manage persistent webhook states.
* **Exit Gate:** The application runs fully detached, offering sub-second omnichannel processing directly from mobile and desktop endpoints.

### 🛠️ Execution Checklist

### Phase 1: Environment & Token Provisioning

* [ ] Create **Master Projects** Database in Notion.
* [ ] Create **Master Kanban Tasks** Database in Notion.
* [ ] Establish a Relation field from Tasks to Projects.
* [ ] Set up an Internal Integration Token (ntn_...) via Notion Developer Portal.
* [ ] Link the Internal Integration to both Notion databases via the UI interface.
* [ ] Register a new bot via Telegram's @BotFather and secure the API HTTP Token.
* [ ] Create a Discord application portal account and acquire a Bot Secret Token.

### Phase 2: Local MCP Core Setup

* [ ] Install Node.js runtime and Python 3.11+ on local developer machine.
* [ ] Run npx -y @modelcontextprotocol/server-notion test string to ensure library accessibility.
* [ ] Run pip install mcp inside a local python virtual environment.
* [ ] Code a local handshake verification script (test_mcp.py) to trace active Node processes.
* [ ] Successfully fetch available tool arrays (notion_create_database_page, notion_query_database) using client standard I/O stream connections.

### Phase 3: Relational Tool Construction

* [ ] Create JSON query parameters to find identical title parameters in the Projects Index database.
* [ ] Write logic tree: parse unique Notion Page IDs from search matching sequences.