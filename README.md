# drew-web

Website, status page and dashboard for [Drew](https://drewbot.xyz), built with
Next.js (App Router), React and Tailwind CSS. Deployed on Vercel.

## Pages

| Path | What it is |
|---|---|
| `/` | Landing page with live stats |
| `/status` | Live shard and service status, server → shard lookup |
| `/premium` | Plans |
| `/developers` | Configuration API docs for developers and AI agents |
| `/dashboard` | Servers you manage (Discord login) |
| `/dashboard/[guildId]` | Settings editor (owner can save; others read-only) |

The dashboard uses the bot's public configuration API — the same endpoints
API tokens use — so validation, audit log and log-channel notices are shared.

## Environment variables

See [`.env.example`](.env.example). All are server-side only.

| Variable | Vercel environments | Purpose |
|---|---|---|
| `DREW_API_URL` | Production, Preview | Bot API base URL |
| `DREW_API_KEY` | Production, Preview (sensitive) | HMAC key shared with the bot; derives the session key |
| `DISCORD_CLIENT_ID` | Production | OAuth client / invite links |
| `DISCORD_CLIENT_SECRET` | All (sensitive) | OAuth code exchange |
| `DISCORD_REDIRECT_URI` | Production | OAuth callback (`/api/auth/discord/callback`) |

## Security

- Encrypted (AES-256-GCM), HttpOnly, SameSite=Lax session cookie, 1 hour.
- OAuth `state` cookie against login CSRF; only `identify guilds` scopes.
- Settings writes require the session, a CSRF token and a same-origin request,
  and only the server owner may save (admins use `/sudo` or an API token).
- Per-request nonce Content-Security-Policy (`src/proxy.ts`), HSTS and
  anti-framing headers (`next.config.ts`).
- The bot API key never reaches the browser.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.
