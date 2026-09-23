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

---

## 🏗️ Architecture

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

## 📌 Decision to make before you start: flat vs. relational Notion schema

**Flat (recommended for MVP):** One database, with a `Project` select property and a `Status` property for Kanban columns. Group-by-Project view gives you per-project boards natively. No parent-page-ID lookups, no relation plumbing.

**Relational (v1's original design):** Separate Projects and Tasks databases linked by a Relation property. More "correct" if you want each project to have its own dedicated page with sub-content beyond tasks. More setup and more failure surface (lookup-or-create logic, ID passing).

Start flat. Migrate to relational later only if you find you actually need per-project pages.

---

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

**Exit criteria:** Sending a message to your Telegram bot creates a correctly-tagged card in Notion within a few seconds.

---

### Stage 2: Relational/Project Logic (only if you decide you need it)

- [ ] Add a "does this project already exist as a distinct entity" check — for the flat schema this is just checking whether the `Project` select value exists; for relational, this is the lookup-or-create page flow from v1.
- [ ] If you're staying flat, this stage may just mean adding new select options dynamically via the API — much simpler than v1's fallback creation engine.

---

### Stage 3: Discord Connector

- [ ] Create a Discord application + bot token.
- [ ] Reuse the exact same handler logic from Stage 1 (LLM call → Notion insert), just swap the listener to `discord.py`.
- [ ] Confirm messages in a Discord channel produce the same Notion cards as Telegram.

**Exit criteria:** Both channels write into the same Notion database with correct `Source` tagging.

---

### Stage 4: Historical Backlog Migration

- [ ] Export Telegram history as JSON (Telegram Desktop → Export Chat History).
- [ ] Export Discord channel history using DiscordChatExporter (free, open source).
- [ ] Export any WhatsApp chats you want archived as `.txt` (via WhatsApp's own export-chat feature) — this is safe since it's a local export, not a live bot.
- [ ] Write a throttled script that runs each historical message through the same LLM classification + Notion insert pipeline, tagging `Source` appropriately per platform. **Watch Gemini's free-tier rate limits here** — batch or add delays so backlog migration doesn't blow through daily/per-minute quotas.

**Exit criteria:** Old messages populate Notion cards without hitting rate limits or duplicating entries.

---

### Stage 5: Deployment

- [ ] Provision an Oracle Cloud Always Free VPS instance (or use a spare machine).
- [ ] Install Python and dependencies directly — skip Docker unless you specifically want portability across machines later. No local model to host, so this VPS can be lightweight (Gemini calls happen over the network).
- [ ] Set up a `systemd` service (or `tmux`/`screen` session) to keep the bot running persistently.
- [ ] Confirm the bot survives a reboot and reconnects automatically.

**Exit criteria:** Bot runs unattended, processes messages in near real-time from both channels.

---

## 🧾 Simplified Checklist

### Phase 1 — Setup
- [ ] Create flat Notion database with the properties above.
- [ ] Generate Notion Integration Token, share DB with it.
- [ ] Get Gemini API key from Google AI Studio.
- [ ] Register Telegram bot token.

### Phase 2 — Telegram MVP
- [ ] Build `aiogram` listener.
- [ ] Wire LLM classification prompt.
- [ ] Wire `notion-client` insert call.
- [ ] Test end-to-end with real messages.

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