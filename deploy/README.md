# Self-hosting the website on the VPS

The site runs in its own container (`drew-web`) next to the bot. The bot's
Caddy (from the `drew` repo) terminates HTTPS for `www.drewbot.xyz` and
forwards to this container over the shared Docker network `drew-edge`. The
container publishes no port to the host.

```
Cloudflare -> Caddy (drew repo, ports 80/443) -> drew-web:3000   (this repo)
                                              -> drew:8000       (the bot API)
```

## One-time setup

1. **Deploy the bot first.** The `drew` repo change creates the `drew-edge`
   network and the Caddy blocks for `www.drewbot.xyz` and the apex redirect.
2. **GitHub Environment `production`** in this repo, with the secrets
   `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (same as the bot) and `WEB_ENV_FILE`.
3. **`WEB_ENV_FILE`** is the contents of the `.env` the container reads:

   ```
   # The bot API over the private Docker network (no Cloudflare hop).
   DREW_API_URL=http://drew:8000
   # Same value as the bot's API_KEY.
   DREW_API_KEY=...
   DISCORD_CLIENT_ID=1441457111409103010
   DISCORD_CLIENT_SECRET=...
   DISCORD_REDIRECT_URI=https://www.drewbot.xyz/api/auth/discord/callback
   ```

   Copy the same values from the Vercel project's environment variables.
4. **Repository variable** `VPS_DEPLOY=true` (Settings > Variables). Until it
   is set, the image and deploy jobs are skipped, so merging does nothing.
5. Push to `main` (or run the Deploy workflow). The workflow builds the image,
   pushes it to GHCR, signs it, copies `deploy/compose.yaml` to
   `~/drew-web` on the VPS and starts the container. It waits for the
   healthcheck (`/api/health`).

## Cutting over from Vercel

1. Check the container before touching DNS:
   `curl -s --resolve www.drewbot.xyz:443:<VPS_IP> -k https://www.drewbot.xyz/api/health`
2. In Cloudflare, point `www` and the apex (proxied, SSL mode Full) at the
   VPS IP, the same record the API host uses.
3. Confirm `/`, `/pricing`, `/status`, `/metrics`, `/es/pricing`, the Discord
   login and `/api/stats` on the live domain.
4. Disconnect the Vercel project (or pause it) once everything works. The
   Discord OAuth redirect URL does not change.

## Rollback

Point the DNS records back at Vercel (keep the project until you are sure), or
redeploy a previous image digest by re-running an older Deploy workflow run.

## Local check of the image

```
docker build -t drew-web .
docker run --rm -p 3000:3000 --env-file .env.local drew-web
```
