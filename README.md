<<<<<<< HEAD
# 🤖 AI Clipboard Agent — Revised Plan (v2)

## Project Summary

This project is a personal knowledge-capture agent that lets you dump quick notes, voice messages, and links into Telegram or Discord and have them automatically turned into organized task cards in Notion. Instead of manually opening Notion and filing things away, you just message your bot — e.g. *"Add draft design to a new project called HydroGrow"* — and it uses Gemini 2.5 Flash to figure out the project, the task, and any relevant context (pulling in article text via trafilatura if you dropped a link), then writes a properly tagged card straight into your Notion Kanban board. It runs as a lightweight always-on Python service, built entirely on free and open-source tools plus Gemini's free API tier, with no paid infrastructure required.

## What Changed From v1

- **WhatsApp dropped entirely** — no live bot, no backlog import. Telegram and Discord only.
- **MCP dropped** — direct Notion Python SDK instead. Your flow is a fixed sequence (classify → lookup → create → insert), not something that benefits from dynamic tool discovery. Fewer moving parts, no subprocess/stdio handshake to debug.
- **Gemini 2.5 Flash (cloud) for entity extraction** — free tier covers personal-use volume, supports native structured/JSON output, and needs no local model hosting.
- **Puppeteer dropped** — `trafilatura` for link text extraction. Add a headless browser later only if you hit JS-only sites.
- **Docker/VPS deferred** — run it on a free-tier VPS (Oracle Cloud Always Free) or a spare machine with `systemd`, no containerization needed until you actually want portable deploys.
- **Build order flipped** — working Telegram MVP first, relational logic second, instead of a strict waterfall that delays a usable tool.
### 🤖 Omnichannel AI Clipboard Agent
=======
# 🤖 Omnichannel AI Clipboard Agent
>>>>>>> 0200c68 (Update README.md)

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

<<<<<<< HEAD
## 🏗️ Architecture

```text
┌──────────────────────┐   ┌──────────────────────┐
│   Telegram Bot        │   │   Discord Bot         │
│   (aiogram)            │   │   (discord.py)        │
└───────────┬───────────┘   └───────────┬───────────┘
            └──────────────┬────────────┘
                            ▼
              ┌───────────────────────────┐
              │   Python Backend Core      │
              │   (single message handler) │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │   Gemini 2.5 Flash (cloud) │
              │   via Google AI API        │
              │   → structured JSON output │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │   Notion Python SDK        │
              │   (notion-client)          │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │   Notion Workspace         │
              │   (flat DB or relational)  │
              └───────────────────────────┘

Optional: trafilatura for link text extraction, called before the LLM step
when a message contains a URL.
```

---

## 🛠️ Technology Stack (all free/open source)

| Layer | Tool | Notes |
|---|---|---|
| Telegram | `aiogram` | Free, official-adjacent, async |
| Discord | `discord.py` | Free, official-adjacent |
| LLM | Google Gemini 2.5 Flash (API) | Free tier at personal-use volume, native JSON schema output |
| Link enrichment | `trafilatura` or `readability-lxml` | Lightweight, no browser process |
| Notion integration | `notion-client` (official Python SDK) | Direct API calls, no MCP layer |
| Backlog parsing | Python `json`/`re` | For Telegram/Discord exports only |
| Hosting | Oracle Cloud Always Free VPS, or spare machine | No cost, `systemd` for persistence |
### 🛠️ Technology Stack
=======
---
>>>>>>> 0200c68 (Update README.md)

# 🛠️ Technology Stack

- **Frontend UI Gateways:** Telegram Bot API (aiogram), Discord Client API (discord.py), and WhatsApp raw log parsers.
- **Core Agent Runtime:** Python 3.11+ using the official Python MCP asynchronous client SDK.
- **Brain Engine:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o (optimized for native JSON-schema tool manipulation).
- **Data Integration Layer:** `server-notion` (Official community MCP server running over Node/npx).
- **Enrichment Tooling:** Puppeteer headless browser MCP server for extracting dark text contexts from unstructured text links.

---

<<<<<<< HEAD
## 📌 Decision to make before you start: flat vs. relational Notion schema

**Flat (recommended for MVP):** One database, with a `Project` select property and a `Status` property for Kanban columns. Group-by-Project view gives you per-project boards natively. No parent-page-ID lookups, no relation plumbing.

**Relational (v1's original design):** Separate Projects and Tasks databases linked by a Relation property. More "correct" if you want each project to have its own dedicated page with sub-content beyond tasks. More setup and more failure surface (lookup-or-create logic, ID passing).

Start flat. Migrate to relational later only if you find you actually need per-project pages.
*"Add draft design to a new project called HydroGrow"*
2. **Entity Recognition & Extraction:** The AI Brain isolates the **Intent** (Create Project + Add Task), the **Project Context** (HydroGrow), and the **Action Item** (draft design).
3. **Database Discovery Loop:** 
=======
# 🔄 Dynamic Ingestion Flow
>>>>>>> 0200c68 (Update README.md)

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

<<<<<<< HEAD
## 🔄 Revised Build Order

### Stage 1: Telegram MVP (get something working fast)

**Goal:** A single working channel end-to-end before touching anything else.

- [ ] Create one flat Notion database with properties: `Name` (title), `Project` (select), `Status` (select: To Do / In Progress / Done), `Source` (select: Telegram/Discord/Manual), `URL` (optional).
- [ ] Generate a Notion Internal Integration Token and share the database with it.
- [ ] Register a Telegram bot via @BotFather, save the token.
- [ ] Get a Gemini API key from Google AI Studio (free tier).
- [ ] Write a Python script using `aiogram` that:
  - Listens for incoming messages.
  - Sends the message text to Gemini 2.5 Flash using its structured/JSON output mode, requesting `{"project": "...", "task": "...", "url": "..."}`.
  - If a URL is detected, run it through `trafilatura` first and pass the extracted text to Gemini as context.
  - Calls `notion-client` to insert a new page into the flat database.
  - Replies in Telegram with a confirmation.

  resources:
  https://pydantic.dev/docs/validation/latest/concepts/json_schema/

**Exit criteria:** Sending a message to your Telegram bot creates a correctly-tagged card in Notion within a few seconds.
### Milestone 1: Tokens & Relational Databases (Days 1-2)
=======
---
>>>>>>> 0200c68 (Update README.md)

## Milestone 1: Tokens & Relational Databases (Days 1–2)

### Tasks

- Create the **Master Projects** parent database in Notion.
- Create the **Master Kanban Tasks** child database.
- Add a Relation property linking the Tasks database to the Projects database.
- Provision Developer Access tokens across Telegram, Discord, and Notion.

### Exit Gate

<<<<<<< HEAD
### Stage 2: Relational/Project Logic (only if you decide you need it)

- [ ] Add a "does this project already exist as a distinct entity" check — for the flat schema this is just checking whether the `Project` select value exists; for relational, this is the lookup-or-create page flow from v1.
- [ ] If you're staying flat, this stage may just mean adding new select options dynamically via the API — much simpler than v1's fallback creation engine.
  * Establish a local Node/Python developer workspace with the official mcp SDK.
  * Initialize the pre-built @modelcontextprotocol/server-notion via an internal pipeline process.
  * Write a basic test client (test_mcp.py) to connect via standard I/O streams.
* **Exit Gate:** Execution logs successfully print discovered server tools and run a non-relational test page creation entry inside the workspace.
=======
Notion Integration is manually bound as a connection to both schemas, and database IDs are securely logged.
>>>>>>> 0200c68 (Update README.md)

---

## Milestone 2: Core MCP Client Handshake (Days 3–4)

### Tasks

- Establish a local Node/Python developer workspace with the official MCP SDK.
- Initialize the pre-built `@modelcontextprotocol/server-notion` via an internal pipeline process.
- Write a basic test client (`test_mcp.py`) to connect via standard I/O streams.

### Exit Gate

Execution logs successfully print discovered server tools and run a non-relational test page creation entry inside the workspace.

---

<<<<<<< HEAD
### Stage 3: Discord Connector

- [ ] Create a Discord application + bot token.
- [ ] Reuse the exact same handler logic from Stage 1 (LLM call → Notion insert), just swap the listener to `discord.py`.
- [ ] Confirm messages in a Discord channel produce the same Notion cards as Telegram.

**Exit criteria:** Both channels write into the same Notion database with correct `Source` tagging.
* **Tasks:** 
=======
## Milestone 3: Dynamic Relational Intelligence (Days 5–7)
>>>>>>> 0200c68 (Update README.md)

### Tasks

- Program the conditional project query tool loop.
- Implement the fallback creation engine that executes when a lookup queries zero results.
- Create the execution pipeline that grabs parent page references and passes them inside relational child objects.

### Exit Gate

Executing the script with a novel project string cleanly populates both tables with an explicit structural database reference bond.

### Stage 4: Historical Backlog Migration

- [ ] Export Telegram history as JSON (Telegram Desktop → Export Chat History).
- [ ] Export Discord channel history using DiscordChatExporter (free, open source).
- [ ] Export any WhatsApp chats you want archived as `.txt` (via WhatsApp's own export-chat feature) — this is safe since it's a local export, not a live bot.
- [ ] Write a throttled script that runs each historical message through the same LLM classification + Notion insert pipeline, tagging `Source` appropriately per platform. **Watch Gemini's free-tier rate limits here** — batch or add delays so backlog migration doesn't blow through daily/per-minute quotas.

**Exit criteria:** Old messages populate Notion cards without hitting rate limits or duplicating entries.
### 🛠️ Execution Checklist
---

## Milestone 4: Omnichannel Client Integrations (Days 8–11)

### Tasks

- Implement the background message loop listeners (aiogram for Telegram and `discord.py` for Discord).
- Build the context parser hooks for parsing raw text and scraping media URLs.
- Wire up the chosen large language model tool-calling interface (Claude 3.5 or GPT-4o) using the local system prompt definitions.

### Stage 5: Deployment

- [ ] Provision an Oracle Cloud Always Free VPS instance (or use a spare machine).
- [ ] Install Python and dependencies directly — skip Docker unless you specifically want portability across machines later. No local model to host, so this VPS can be lightweight (Gemini calls happen over the network).
- [ ] Set up a `systemd` service (or `tmux`/`screen` session) to keep the bot running persistently.
- [ ] Confirm the bot survives a reboot and reconnects automatically.

**Exit criteria:** Bot runs unattended, processes messages in near real-time from both channels.

References:
-https://developers.notion.com/guides/mcp/overview

---

## 🧾 Simplified Checklist

### Phase 1 — Setup
- [ ] Create flat Notion database with the properties above.
- [ ] Generate Notion Integration Token, share DB with it.
- [ ] Get Gemini API key from Google AI Studio.
- [ ] Register Telegram bot token.

+ To deploy coduck_bot.py into vercel for serverless use.

### Phase 2 — Telegram MVP
- [ ] Build `aiogram` listener.
- [ ] Wire LLM classification prompt.
- [ ] Wire `notion-client` insert call.
- [ ] Test end-to-end with real messages.

### Phase 3 — Link Enrichment
- [ ] Add `trafilatura` extraction step for messages containing URLs.
- [ ] Pass extracted text into the LLM prompt as additional context.

### Phase 4 — Discord
- [ ] Register Discord bot token.
- [ ] Reuse handler logic with `discord.py` listener.

### Phase 5 — Backlog Migration
- [ ] Export Telegram/Discord/WhatsApp history.
- [ ] Run throttled classification + insert script over exports.

### Phase 6 — Deployment
- [ ] Provision free VPS.
- [ ] Set up `systemd` service.
- [ ] Confirm persistence across reboots.

---

## Open Questions for You

1. **Flat vs. relational Notion schema** — do you want dedicated project pages, or is a single filtered database enough?
2. **Voice notes** — Gemini 2.5 Flash can accept audio directly, so voice notes can skip a separate transcription step and go straight into the same classification call. Worth confirming this is how you want to handle Telegram/Discord voice messages, since it slightly changes the Stage 1 handler (send audio bytes to Gemini instead of text).
* [ ] Install Node.js runtime and Python 3.11+ on local developer machine.
* [ ] Run npx -y @modelcontextprotocol/server-notion test string to ensure library accessibility.
* [ ] Run pip install mcp inside a local python virtual environment.
* [ ] Code a local handshake verification script (test_mcp.py) to trace active Node processes.
* [ ] Successfully fetch available tool arrays (notion_create_database_page, notion_query_database) using client standard I/O stream connections.
### Exit Gate

Live text strings sent into a Telegram chat window or Discord channel trigger the agent to intelligently classify context fields, execute structural tool actions, and ping back a confirmation message.

* [ ] Create JSON query parameters to find identical title parameters in the Projects Index database.
* [ ] Write logic tree: parse unique Notion Page IDs from search matching sequences.
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

- [ ] Create JSON query parameters to find identical title parameters in the Projects Index database.
- [ ] Write a logic tree to parse unique Notion Page IDs from search matching sequences.
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
