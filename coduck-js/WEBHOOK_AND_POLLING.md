# Switching Between Telegram Webhooks and Long Polling

This project can use the same Telegram bot token for:

- **Webhook mode** in production on Vercel
- **Long polling mode** during local development

Telegram only allows one update-delivery mode for a bot at a time. Do not run
production webhook delivery and local polling simultaneously with the same
token.

## Production: webhook mode on Vercel

The Vercel webhook handler is:

```text
api/coduck_bot.ts
```

The configured webhook routes are:

```text
https://YOUR_VERCEL_DOMAIN/telegram/webhook
https://YOUR_VERCEL_DOMAIN/
```

Use the explicit `/telegram/webhook` route for new webhook configurations:

```text
https://YOUR_VERCEL_DOMAIN/telegram/webhook
```

The direct Vercel function route is also available:

```text
https://YOUR_VERCEL_DOMAIN/api/coduck_bot
```

The Express chat API is separate:

```text
https://YOUR_VERCEL_DOMAIN/api/chat
```

The bot handler can call that API through:

```text
CODUCK_API_URL=https://YOUR_VERCEL_DOMAIN
```

Do not start long polling inside `api/coduck_bot.ts`. Vercel functions are
request-based and are not persistent processes.

## Development: switch to long polling

Before starting local polling, remove the webhook:

```ts
await bot.api.deleteWebhook({
  drop_pending_updates: false,
});
```

Then start the bot:

```ts
bot.start({
  onStart: (info) => {
    console.log(`Polling as @${info.username}`);
  },
});
```

Keep the polling startup in a separate local entrypoint, such as `dev.ts`.
Share the bot instance and message handlers with the Vercel handler, but do
not import a polling startup into the Vercel function.

The `drop_pending_updates` option controls queued messages:

- `false` preserves updates received while switching modes.
- `true` discards all pending updates.

## Switch back to production

1. Stop the local polling process.
2. Deploy the Vercel function.
3. Register the webhook:

```ts
await bot.api.setWebhook(
  "https://YOUR_VERCEL_DOMAIN/telegram/webhook"
);
```

You can check the current Telegram delivery mode:

```ts
const info = await bot.api.getWebhookInfo();
console.log(info);
```

If `info.url` is non-empty, webhook mode is active. If it is empty, polling
can be used.

## Important rules

- Only run one long-polling process at a time.
- Stop local polling before enabling the production webhook.
- Stop local polling before deploying or testing webhook mode.
- A browser `GET` request is not a valid webhook test. Telegram sends a
  `POST` request.
- Keep the bot token in environment variables. Never commit it or print it in
  logs.
- Configure the bot token and other required environment variables in both
  local development and Vercel.

The same token is fine; only the Telegram update-delivery mode changes.