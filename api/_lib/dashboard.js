const { getInstalledGuilds, isConfigured } = require("./drew");

const BOT_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1441457111409103010";
const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

const numberFormat = new Intl.NumberFormat("es-ES");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const avatarUrlFor = (user) => {
  if (!user?.id || !user?.avatar) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
};

const guildIconUrlFor = (guild) => {
  if (!guild?.id || !guild?.icon) {
    return null;
  }

  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
};

const permissionsOf = (guild) => {
  try {
    return BigInt(guild.permissions_new ?? guild.permissions ?? 0);
  } catch (_error) {
    return 0n;
  }
};

const isAdminOf = (guild) => (permissionsOf(guild) & ADMINISTRATOR) === ADMINISTRATOR;

const canManage = (guild) =>
  Boolean(guild.owner) ||
  isAdminOf(guild) ||
  (permissionsOf(guild) & MANAGE_GUILD) === MANAGE_GUILD;

const inviteUrlFor = (guildId) => {
  const params = new URLSearchParams({
    client_id: BOT_CLIENT_ID,
    permissions: "8",
    integration_type: "0",
    scope: "bot applications.commands",
    guild_id: guildId,
    disable_guild_select: "true",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
};

const PROTECTIONS = [
  ["anti_nuke_enabled", "Anti-nuke"],
  ["anti_raid_enabled", "Anti-raid"],
  ["anti_spam_enabled", "Anti-spam"],
  ["automod_enabled", "Automod"],
  ["verification_enabled", "Verificación"],
  ["logging_enabled", "Logs"],
];

const renderDrewStatus = (guild, installed, apiAvailable) => {
  if (!apiAvailable) {
    return "";
  }

  if (!installed) {
    return `
      <div class="oauth-guild-card__drew">
        <p class="oauth-guild-card__note">Drew no está en este servidor.</p>
        <a class="cta cta--small" href="${escapeHtml(inviteUrlFor(guild.id))}">Invitar a Drew</a>
      </div>
    `;
  }

  const settings = installed.settings;
  const memberCount = Number(installed.member_count) || 0;
  const protections = settings
    ? PROTECTIONS.map(
        ([key, label]) =>
          `<li class="oauth-protection ${settings[key] ? "oauth-protection--on" : "oauth-protection--off"}">
            <span aria-hidden="true">${settings[key] ? "●" : "○"}</span>
            ${escapeHtml(label)}
            <span class="visually-hidden">${settings[key] ? "activado" : "desactivado"}</span>
          </li>`,
      ).join("")
    : "";

  return `
    <div class="oauth-guild-card__drew">
      <p class="oauth-guild-card__note">${numberFormat.format(memberCount)} miembros</p>
      ${protections ? `<ul class="oauth-protections">${protections}</ul>` : ""}
    </div>
  `;
};

const renderGuildCard = (guild, installed, apiAvailable) => {
  const guildName = escapeHtml(guild.name || "Servidor sin nombre");
  const guildIcon = guildIconUrlFor(guild);
  const isAdmin = isAdminOf(guild);

  return `
    <article class="dashboard-card oauth-guild-card">
      <div class="oauth-guild-card__head">
        ${
          guildIcon
            ? `<img class="oauth-guild-card__icon" src="${escapeHtml(guildIcon)}" alt="${guildName}" loading="lazy" />`
            : `<div class="oauth-guild-card__icon oauth-guild-card__icon--fallback">${guildName.slice(0, 1).toUpperCase()}</div>`
        }
        <div>
          <h3>${guildName}</h3>
          <p>ID: <code>${escapeHtml(guild.id)}</code></p>
        </div>
      </div>
      <div class="oauth-guild-card__badges">
        ${guild.owner ? '<span class="badge oauth-badge-owner">Owner</span>' : ""}
        ${isAdmin ? '<span class="badge oauth-badge-admin">Admin</span>' : ""}
        ${installed ? '<span class="badge oauth-badge-drew">Drew activo</span>' : ""}
      </div>
      ${renderDrewStatus(guild, installed, apiAvailable)}
    </article>
  `;
};

const renderAuthPage = (user, guilds, installedGuilds, apiAvailable) => {
  const avatarUrl = avatarUrlFor(user);
  const safeDisplayName = escapeHtml(user.global_name || user.username || "Usuario");
  const safeUsername = escapeHtml(user.username || "unknown");
  const safeEmail = escapeHtml(user.email || "No disponible");
  const manageableGuilds = guilds
    .filter(canManage)
    // Servers with Drew first, then alphabetically.
    .sort((a, b) => {
      const installedDiff =
        Number(installedGuilds.has(b.id)) - Number(installedGuilds.has(a.id));
      return installedDiff || String(a.name).localeCompare(String(b.name));
    });
  const totalGuilds = manageableGuilds.length;
  const withDrew = manageableGuilds.filter((guild) => installedGuilds.has(guild.id)).length;
  const protectedGuilds = manageableGuilds.filter((guild) => {
    const settings = installedGuilds.get(guild.id)?.settings;
    return settings && (settings.anti_nuke_enabled || settings.anti_raid_enabled);
  }).length;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Drew Dashboard</title>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
    <script defer src="/theme.js"></script>
    <style>
      .oauth-grid {
        display: grid;
        gap: 24px;
      }

      .oauth-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 24px;
      }

      .oauth-stat h3 {
        font-size: 0.95rem;
        color: var(--muted);
        margin-bottom: 12px;
      }

      .oauth-stat p {
        font-size: 2rem;
        font-weight: 700;
      }

      .oauth-profile {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .oauth-profile__avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--stroke);
      }

      .oauth-profile__fallback {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f2b400, #0d0d0d);
        color: #ffffff;
        font-weight: 700;
      }

      .oauth-profile h2 {
        margin-bottom: 6px;
      }

      .oauth-profile p {
        color: var(--muted);
        margin: 0;
      }

      .oauth-guilds__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .oauth-guilds__header p {
        color: var(--muted);
        margin: 0;
      }

      .oauth-guilds-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
      }

      .oauth-guild-card {
        display: grid;
        gap: 12px;
      }

      .oauth-guild-card__head {
        display: flex;
        gap: 12px;
      }

      .oauth-guild-card__icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        object-fit: cover;
        border: 1px solid var(--stroke);
      }

      .oauth-guild-card__icon--fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        background: var(--accent);
        color: var(--cta-text);
      }

      .oauth-guild-card h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
      }

      .oauth-guild-card p {
        color: var(--muted);
        font-size: 0.88rem;
      }

      .oauth-guild-card__badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .oauth-badge-owner {
        background: #f2b400;
        color: #000;
      }

      .oauth-badge-admin {
        background: var(--accent);
        color: var(--cta-text);
      }

      .oauth-empty {
        color: var(--muted);
      }

      .oauth-badge-drew {
        background: #1f9d55;
        color: #ffffff;
      }

      .oauth-badge-owner,
      .oauth-badge-admin,
      .oauth-badge-drew {
        margin-top: 0;
      }

      .oauth-guild-card__drew {
        display: grid;
        gap: 10px;
        justify-items: start;
      }

      .oauth-guild-card__note {
        margin: 0;
      }

      .oauth-protections {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;
        font-size: 0.85rem;
      }

      .oauth-protection--on span[aria-hidden] {
        color: #1f9d55;
      }

      .oauth-protection--off {
        color: var(--muted);
        opacity: 0.7;
      }

      .oauth-notice {
        color: var(--muted);
        margin: 0;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

    </style>
  </head>
  <body>
    <header class="topbar">
      <a class="logo" href="/">Drew</a>
      <nav class="nav">
        <a href="/status.html">Status</a>
        <a class="nav__premium" href="/premium.html">Premium</a>
        <a href="https://discord.gg/5e2jm7QDSS" target="_blank" rel="noreferrer">Support</a>
      </nav>
      <div class="topbar__actions">
        <a class="cta cta--small" href="/api/auth/discord">Dashboard</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode">
          <span class="theme-toggle__text" data-theme-label>light</span>
        </button>
      </div>
    </header>

    <main class="dashboard-shell oauth-grid">
      <section class="dashboard-auth">
        <article class="dashboard-auth__card">
          <div class="oauth-profile">
            ${
              avatarUrl
                ? `<img class="oauth-profile__avatar" src="${escapeHtml(avatarUrl)}" alt="Avatar de ${safeDisplayName}" />`
                : `<div class="oauth-profile__fallback">${safeDisplayName.slice(0, 1).toUpperCase()}</div>`
            }
            <div>
              <h2>${safeDisplayName}</h2>
              <p>@${safeUsername}</p>
              <p>${safeEmail}</p>
            </div>
          </div>
        </article>
      </section>



      <section class="oauth-stats" aria-label="Resumen">
        <article class="dashboard-card oauth-stat">
          <h3>Servidores gestionables</h3>
          <p>${numberFormat.format(totalGuilds)}</p>
        </article>
        ${
          apiAvailable
            ? `<article class="dashboard-card oauth-stat">
          <h3>Con Drew</h3>
          <p>${numberFormat.format(withDrew)}</p>
        </article>
        <article class="dashboard-card oauth-stat">
          <h3>Con anti-nuke o anti-raid</h3>
          <p>${numberFormat.format(protectedGuilds)}</p>
        </article>`
            : ""
        }
      </section>

      <section class="dashboard-card oauth-guilds">
        <div class="oauth-guilds__header">
          <h2>Servidores gestionables</h2>
          <p>${totalGuilds} encontrados</p>
        </div>
        ${
          apiAvailable
            ? ""
            : '<p class="oauth-notice">No se pudo obtener el estado de Drew en tus servidores. Inténtalo de nuevo en unos minutos.</p>'
        }
        ${
          totalGuilds === 0
            ? '<p class="oauth-empty">No administras ningún servidor.</p>'
            : `<div class="oauth-guilds-list">
          ${manageableGuilds
            .map((guild) => renderGuildCard(guild, installedGuilds.get(guild.id), apiAvailable))
            .join("")}
        </div>`
        }
      </section>
    </main>

    <footer class="footer">
      <div>
        <h4>Drew</h4>
        <p>Advanced security and automation for Discord communities.</p>
        <p class="footer__meta">Made by Stane.</p>
      </div>
      <div>
        <h4>Product</h4>
        <ul>
          <li><a href="/premium.html">Premium</a></li>
          <li><a href="/api/auth/discord">Dashboard</a></li>
          <li>
            <a href="https://discord.com/oauth2/authorize?client_id=1441457111409103010&permissions=8&integration_type=0&scope=bot+applications.commands">Invite</a>
          </li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="/status.html">Status</a></li>
          <li><a href="https://docs.neevets.website">Docs</a></li>
          <li><a href="https://discord.gg/5e2jm7QDSS" target="_blank" rel="noreferrer">Support</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <p>© 2025 Drew. All rights reserved.</p>
        <ul>
          <li><a href="https://docs.neevets.website/legal/privacy/">Privacy Policy</a></li>
          <li><a href="https://docs.neevets.website/legal/terms/">Terms of Service</a></li>
        </ul>
      </div>
    </footer>

  </body>
</html>`;
};

const redirectToDiscordAuth = (response) =>
  response.redirect(302, "/api/auth/discord");

const parseJsonSafely = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

module.exports = async (request, response) => {
  const code = request.query.code;

  if (!code || typeof code !== "string") {
    return redirectToDiscordAuth(response);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return response.status(500).json({
      error: "Missing Discord OAuth environment variables.",
    });
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      const tokenError = parseJsonSafely(errorBody);

      if (tokenError?.error === "invalid_grant") {
        return redirectToDiscordAuth(response);
      }

      return response.status(502).json({
        error: "Failed to exchange Discord OAuth code.",
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const [userResponse, guildsResponse] = await Promise.all([
      fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    if (!userResponse.ok) {
      return response.status(502).json({
        error: "Failed to fetch Discord user profile.",
      });
    }

    const user = await userResponse.json();
    const guildsBody = guildsResponse.ok ? await guildsResponse.json() : [];
    const guilds = Array.isArray(guildsBody) ? guildsBody : [];

    // Ask the bot which of the user's manageable guilds it is in. The page
    // still renders (without Drew data) if the bot API is unavailable.
    let installedGuilds = new Map();
    let apiAvailable = false;
    if (isConfigured()) {
      try {
        installedGuilds = await getInstalledGuilds(guilds.filter(canManage).map((g) => g.id));
        apiAvailable = true;
      } catch (_error) {
        apiAvailable = false;
      }
    }

    return response
      .status(200)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .setHeader("Cache-Control", "private, no-store")
      .send(renderAuthPage(user, guilds, installedGuilds, apiAvailable));
  } catch (_error) {
    return response.status(500).json({
      error: "Unexpected error while completing Discord OAuth.",
    });
  }
};
