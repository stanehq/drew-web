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

const renderGuildIcon = (guild, guildName) => {
  const guildIcon = guildIconUrlFor(guild);
  return guildIcon
    ? `<img class="dash-guild__icon" src="${escapeHtml(guildIcon)}" alt="" loading="lazy" />`
    : `<span class="dash-guild__icon dash-guild__icon--fallback" aria-hidden="true">${guildName.slice(0, 1).toUpperCase()}</span>`;
};

const renderProtections = (settings) => {
  if (!settings) {
    return "";
  }
  const items = PROTECTIONS.map(
    ([key, label]) =>
      `<li class="${settings[key] ? "" : "is-off"}">${escapeHtml(label)}<span class="visually-hidden">: ${
        settings[key] ? "activado" : "desactivado"
      }</span></li>`,
  ).join("");
  return `<ul class="check-list dash-guild__protections">${items}</ul>`;
};

const renderGuildCard = (guild, installed, apiAvailable) => {
  const guildName = escapeHtml(guild.name || "Servidor sin nombre");
  const badges = [
    guild.owner ? '<span class="pill pill--dark">Owner</span>' : "",
    !guild.owner && isAdminOf(guild) ? '<span class="pill">Admin</span>' : "",
    installed ? '<span class="pill pill--accent">Drew activo</span>' : "",
  ].join("");

  let body = "";
  let actions = "";
  if (apiAvailable && installed) {
    const memberCount = Number(installed.member_count) || 0;
    body = `
      <p class="dash-guild__members"><strong>${numberFormat.format(memberCount)}</strong> miembros</p>
      ${renderProtections(installed.settings)}`;
    actions = `<a class="ghost" href="/status.html?server=${escapeHtml(guild.id)}">Ver shard y estado</a>`;
  } else if (apiAvailable) {
    body = '<p class="dash-guild__note">Drew aún no está en este servidor.</p>';
    actions = `<a class="cta cta--discord" href="${escapeHtml(inviteUrlFor(guild.id))}">Invitar a Drew</a>`;
  }

  return `
    <article class="surface-card dash-guild${installed ? " surface-card--accent" : ""}">
      <header class="dash-guild__head">
        ${renderGuildIcon(guild, guildName)}
        <div class="dash-guild__title">
          <h3>${guildName}</h3>
          <p class="stat-note">ID ${escapeHtml(guild.id)}</p>
        </div>
      </header>
      ${badges ? `<div class="dash-guild__badges">${badges}</div>` : ""}
      ${body}
      ${actions ? `<div class="dash-guild__actions">${actions}</div>` : ""}
    </article>
  `;
};

const renderAuthPage = (user, guilds, installedGuilds, apiAvailable) => {
  const avatarUrl = avatarUrlFor(user);
  const safeDisplayName = escapeHtml(user.global_name || user.username || "Usuario");
  const safeUsername = escapeHtml(user.username || "unknown");
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
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
    <script defer src="/theme.js"></script>
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
        <a class="cta cta--small" href="/api/auth/discord" aria-current="page">Dashboard</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode">
          <span class="theme-toggle__text" data-theme-label>light</span>
        </button>
      </div>
    </header>

    <main>
      <section class="page-head dash-head">
        ${
          avatarUrl
            ? `<img class="dash-head__avatar" src="${escapeHtml(avatarUrl)}" alt="" />`
            : `<span class="dash-head__avatar dash-head__avatar--fallback" aria-hidden="true">${safeDisplayName.slice(0, 1).toUpperCase()}</span>`
        }
        <p class="eyebrow">Dashboard</p>
        <h1 class="page-head__title">Hola, <span class="gradient-text">${safeDisplayName}</span></h1>
        <p class="page-head__copy">Conectado como @${safeUsername}. Estos son los servidores que puedes gestionar.</p>
      </section>

      <div class="page-body">
        <section class="stat-grid" aria-label="Resumen">
          <article class="surface-card">
            <p class="card-label">Servidores gestionables</p>
            <p class="stat-value">${numberFormat.format(totalGuilds)}</p>
          </article>
          ${
            apiAvailable
              ? `<article class="surface-card">
            <p class="card-label">Con Drew</p>
            <p class="stat-value stat-value--accent">${numberFormat.format(withDrew)}</p>
          </article>
          <article class="surface-card">
            <p class="card-label">Con anti-nuke o anti-raid</p>
            <p class="stat-value">${numberFormat.format(protectedGuilds)}</p>
          </article>`
              : ""
          }
        </section>

        <section aria-labelledby="guilds-title">
          <div class="dash-section-head">
            <div>
              <p class="card-label">Tus servidores</p>
              <h2 id="guilds-title" class="card-title">Servidores gestionables</h2>
            </div>
            <p class="stat-note">${totalGuilds} encontrados</p>
          </div>
          ${
            apiAvailable
              ? ""
              : '<p class="dash-notice">No se pudo obtener el estado de Drew en tus servidores. Inténtalo de nuevo en unos minutos.</p>'
          }
          ${
            totalGuilds === 0
              ? '<p class="dash-notice">No administras ningún servidor.</p>'
              : `<div class="dash-guilds">
            ${manageableGuilds
              .map((guild) => renderGuildCard(guild, installedGuilds.get(guild.id), apiAvailable))
              .join("")}
          </div>`
          }
        </section>
      </div>
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
          <li><a href="https://discord.com/oauth2/authorize?client_id=1441457111409103010&amp;permissions=8&amp;integration_type=0&amp;scope=bot+applications.commands">Invite</a></li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="/status.html">Status</a></li>
          <li><a href="https://docs.drewbot.xyz">Docs</a></li>
          <li><a href="https://discord.gg/5e2jm7QDSS" target="_blank" rel="noreferrer">Support</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <p>© 2025 Drew. All rights reserved.</p>
        <ul>
          <li><a href="https://drewbot.xyz/privacy/">Privacy Policy</a></li>
          <li><a href="https://drewbot.xyz/tos/">Terms of Service</a></li>
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
