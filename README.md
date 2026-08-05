# AI Telegram Clipboard Agent

## 📋 Executive Summary

A frictionless, voice- and text-driven personal knowledge ingestion pipeline. Users dump messy, unstructured thoughts, voice notes, and web links into a private Telegram chat. An autonomous AI agent leverages the Model Context Protocol (MCP) to parse, enrich, summarize, and instantly organize this data into the correct status columns on a centralized Notion Kanban board.

---

# 🛠️ Technology Stack

```text
┌────────────────────────────────────────────────────────┐
│                      USER FACING                       │
│                     Telegram Bot                       │
└──────────────────────────┬─────────────────────────────┘
                           │ (Webhooks / Polling)
                           ▼
┌────────────────────────────────────────────────────────┐
│                    APPLICATION HOST                    │
│        Python (FastAPI / aiogram) OR Node.js (Telegraf)│
└──────────────────────────┬─────────────────────────────┘
                           │ (MCP Client SDK)
                           ▼
┌────────────────────────────────────────────────────────┐
│                       AI ENGINE                        │
│            Anthropic Claude 3.5 / OpenAI GPT-4o        │
└──────────────────────────┬─────────────────────────────┘
                           │ (Tool Calls)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   MCP SERVER LAYER                     │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   Notion MCP Server   │   │  Puppeteer/Fetch MCP │  │
│  └───────────┬───────────┘   └──────────┬───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │ (Notion API)             │ (Web Scraping)
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│     Notion Database      │   │     Target Web Pages     │
│     (Kanban Board)       │   │   (Content Extraction)   │
└──────────────────────────┘   └──────────────────────────┘
```

| Layer | Recommended Technology | Alternatives | Purpose |
|--------|------------------------|--------------|---------|
| Frontend UI | Telegram Bot API | Discord Bot, WhatsApp Business | Ubiquitous, fast input from mobile and desktop. |
| App Runtime | Python (aiogram + mcp SDK) | TypeScript / Node.js (Telegraf) | Handles bot polling, user sessions, and MCP client logic. |
| Orchestration | LangChain or LangGraph | Native MCP SDK Tool-Calling Loop | Manages agent state and tool invocation routing. |
| Core Brain | Anthropic Claude 3.5 Sonnet | OpenAI GPT-4o | Market leader in logical tool execution and MCP support. |
| Data Bridge | Community Notion MCP Server | Custom Integration via @notionhq/client | Eliminates boilerplates for Notion DB updates. |
| Enrichment | Puppeteer MCP Server | Brave Search MCP Server | Fetches text from links to create automated AI summaries. |

---

# 🔄 System Flow

## 1. Ingestion

User shares a message to the bot:

> "Review this framework tonight: https://example.com"

---

## 2. Intent Analysis

The Telegram Backend captures the text and forwards it to the LLM.

The LLM runs an intent evaluation loop:

- **Entities Extracted:** URL (`https://example.com`), Timeline constraint ("tonight")
- **Categorization Intent:** Project management / Bookmarks
- **Target Kanban Column:** "To Do" or "Reading List"

---

## 3. Execution (The MCP Loop)

### Step A (Enrichment)

The LLM realizes it needs page context. It fires a tool call to the Puppeteer/Fetch MCP Server to scrape the page text.

### Step B (Summarization)

The MCP server passes raw text back. The LLM condenses it into a 2-sentence summary.

### Step C (Database Ingestion)

The LLM constructs a structured payload and fires a tool call to the Notion MCP Server (`create_database_page`).

---

## 4. Confirmation

Notion API acknowledges the insertion.

Telegram bot replies with a clean rich-text card:

> ✅ Added to To Do!  
> **[Title of Site]** summarized:  
> *[Brief AI summary]*

---

# 🚀 Development Roadmap

## Phase 1: Environment & Token Provisioning

- Create your bot using Telegram’s `@BotFather` and save the HTTP API bot token.
- Create an internal integration token inside your Notion Developer Portal.
- Share a target Kanban database with your Notion integration and record the `database_id`.

---

## Phase 2: Local MCP Integration (The Core)

- Set up a local development directory.
- Run the pre-made Notion MCP server locally using environment flags for your tokens.
- Write a small standalone script using the standard MCP library to confirm your environment can write a test card directly into your Notion board without Telegram involved.

References:
-https://developers.notion.com/guides/mcp/overview

---

## Phase 3: Bot Brain & Routing

- Build the application host server using your language of choice.
- Connect your LLM API provider to the application host.
- Register the local Notion and Fetch MCP servers as accessible tools to your LLM configuration profile.
- Give the system a system prompt outlining your target board columns so it knows how to categorize incoming data.

---

## Phase 4: Chat Integration & Deployment

- Wire up your Telegram listener to pass incoming text to your local host processing queue.
- Format the return object from your tool pipeline into a user-friendly Telegram message format.
- Containerize your setup using Docker and deploy it to a lightweight VPS (like DigitalOcean, Hetzner, or AWS EC2) so your bot remains running 24/7.