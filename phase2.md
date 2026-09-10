# Phase 2 — Packaging for Non-Technical Self-Hosters

## How this relates to your MVP

This is a **separate, later project**, not an extension of the MVP checklist. The MVP (Telegram → Gemini → Notion, run as a personal script) should be built and used first — it proves the core logic works and teaches you what the tool actually needs to do well. This document is what comes *after* that, once you're ready to make the tool installable by someone with zero IT background.

Do not try to build both at once. The MVP is a script you run. This phase turns that proven logic into a product someone else can install and use without a terminal.

---

## The core constraint to design around

Self-hosted + zero IT knowledge is a real tension, not a solved problem — someone's machine still has to run a persistent process. The goal here isn't to eliminate that, it's to hide every technical step behind a UI so the user never sees a terminal, a `.env` file, or a raw API token they don't understand.

Three technical steps are unavoidable no matter how well this is packaged:
1. Downloading and running *something* on their machine.
2. Getting a Gemini API key (Google doesn't offer OAuth for this).
3. Creating a Telegram bot via @BotFather (no OAuth equivalent exists for bot creation).

Everything else can be hidden. The plan below is built around minimizing and guiding through those three unavoidable steps, and removing every other point of friction entirely.

---

## Architecture Shift: Script → Desktop App

```text
Current MVP:
  Terminal → python app.py → reads .env → runs forever in that terminal

Phase 2:
  Double-click installer → small local app window opens →
  guided setup screens → runs in background (tray icon) →
  same Python logic underneath, just no longer terminal-driven
```

### Recommended approach: wrap the existing Python backend in a desktop shell

- Use **Tauri** (lighter, Rust-based shell, smaller install size) or **Electron** (heavier, more mature ecosystem) to wrap a local web UI around your existing `app.py` logic.
- The Python backend runs as a bundled local process; the desktop shell just provides the setup UI and a "running/not running" tray icon.
- This means your MVP's core logic (`parser.py`, `notion_service.py`, `telegram_bot.py`) is reused almost as-is — Phase 2 adds a UI layer and packaging around it, it doesn't rewrite the pipeline.

---

## Removing Manual Token Handling

### Notion — solvable with OAuth
Register a **Notion OAuth integration** once, as the project maintainer. Self-hosted users then get a "Connect to Notion" button in the desktop app that opens their browser to Notion's consent screen — they click "Allow," and the app receives the token automatically. No copying an "Internal Integration Token," no manually sharing a database in Notion's UI.

- [ ] Register one Notion OAuth app under the project.
- [ ] Implement the OAuth redirect flow in the desktop app's local web UI.
- [ ] Auto-create (or let the user pick) the target database on first connect, so they never see raw database IDs.

### Gemini — no OAuth available, but guide it heavily
Google doesn't offer an OAuth flow for API key issuance the way Notion does, so this step can't be fully hidden. Soften it instead:

- [ ] In-app screen: "Paste your Gemini API key here," with a direct link to Google AI Studio and 2–3 screenshots showing exactly where to click.
- [ ] Validate the key immediately in-app (test call) so the user gets instant feedback instead of a silent failure later.

### Telegram — no OAuth for bot creation, but pick one of two paths

**Option A — user creates their own bot (fully self-hosted, more setup):**
- [ ] In-app button: "Open Telegram and message @BotFather" — pre-fill the `/newbot` command and a suggested name so the user only has to send two messages and copy back one token.
- [ ] In-app field to paste that token back, validated immediately.

**Option B — shared bot, routed by user (less setup, small shared infra):**
- [ ] The project runs one public Telegram bot.
- [ ] Users link their Notion connection (via OAuth) to their Telegram account (e.g. by sending a one-time linking code from the app to the bot).
- [ ] Removes the BotFather step entirely, at the cost of you (the maintainer) running one small always-on service.

Recommendation: ship Option A first (keeps this a purely self-hosted app with the maintainer running nothing), and consider Option B later only if bot creation turns out to be the biggest drop-off point in testing.

---

## Removing Configuration Decisions

- [ ] Ship with the flat Notion schema (single database, `Project` select property) as the only default — no schema choice shown during setup.
- [ ] Auto-generate sensible property names (`Task`, `Project`, `Status`, `Source`) with no user input required.
- [ ] Keep advanced configuration (schema type, custom properties, model choice) in an optional "Advanced" panel, collapsed by default — visible only to users who go looking for it.

---

## Guided Setup Flow (what the user actually sees)

1. **Download & open the app** — single installer file, double-click, no terminal.
2. **Welcome screen** — one sentence explaining what the tool does.
3. **"Connect to Notion"** — OAuth button, one click, done.
4. **"Connect to Telegram"** — guided BotFather flow (Option A above), paste-back token.
5. **"Add your Gemini API key"** — guided link + screenshots, paste-back key, instant validation.
6. **"You're all set"** — send a test message to your bot right from the app to confirm it works.
7. App minimizes to a tray icon and runs in the background from then on.

No step involves a file path, a terminal command, or an unexplained acronym.

---

## Suggested Build Order for Phase 2

| Step | Goal | Depends on |
|---|---|---|
| 1 | Wrap existing MVP logic in a local Tauri/Electron shell, no setup UI yet — just prove it runs packaged | Working MVP |
| 2 | Build the guided setup UI (steps 1–7 above), still using manual token paste for all three services | Step 1 |
| 3 | Add Notion OAuth, replacing the manual Notion token step | Step 2 |
| 4 | Add the guided BotFather flow for Telegram | Step 2 |
| 5 | Package as installers for Windows/Mac/Linux, test with actual non-technical users | Steps 1–4 |
| 6 | (Optional) Build the shared-bot (Option B) path if bot creation proves to be a major drop-off point | Step 5 + real usage data |

---

## What NOT to do in Phase 2

- Don't add Discord, backlog migration, or MCP-based agentic features here — those are separate from the packaging problem and should stay out of scope until the install/setup experience itself is solid.
- Don't attempt full SaaS hosting (you running the backend for everyone) — that's a different project with different constraints (cost, uptime, multi-tenant data handling). This plan stays strictly self-hosted, just packaged well.
- Don't expose the flat-vs-relational schema decision, or any Gemini model-selection option, in the default setup flow — these belong in an optional advanced panel, not the guided path.