// Settings editor for one guild. It reads everything through the public
// configuration API (schema, settings, channels, roles), acting for the
// logged-in user, exactly like an API token would.

const {
  DrewApiError,
  getGuild,
  getGuildChannels,
  getGuildRoles,
  getGuildSettings,
  getSchema,
  isConfigured,
} = require("../_lib/drew");
const { renderPage } = require("../_lib/layout");
const { readSession, sessionCanEdit, sessionCanView, setHtmlSecurityHeaders } = require("../_lib/security");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const CATEGORY_LABELS = {
  anti_nuke: ["Anti-nuke", "Castiga a quien borre o cree canales y roles en masa."],
  anti_raid: ["Anti-raid", "Detecta entradas masivas de miembros."],
  blacklist: ["Blacklist", "Expulsa a usuarios en la blacklist global."],
  logging: ["Logs", "Dónde y qué registra Drew."],
  verification: ["Verificación", "Rol y canal del panel de verificación."],
  upcoming: ["Próximamente", "Se guardan, pero todavía no tienen efecto."],
};

const LABEL_OVERRIDES = {
  anti_nuke_enabled: "Anti-nuke activado",
  anti_raid_enabled: "Anti-raid activado",
  blacklist_enabled: "Blacklist activada",
};

const labelFor = (key) =>
  LABEL_OVERRIDES[key] ||
  key
    .replace(/_ids?$/, "")
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());

const option = (value, label, selected) =>
  `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(label)}</option>`;

const renderControl = (field, value, ctx) => {
  const id = `f-${field.key}`;
  const common = `id="${id}" name="${escapeHtml(field.key)}" data-key="${escapeHtml(field.key)}" data-type="${escapeHtml(field.type)}"${ctx.readOnly ? " disabled" : ""}`;
  switch (field.type) {
    case "boolean":
      return `<label class="dash-toggle"><input type="checkbox" ${common}${value ? " checked" : ""} /><span>${value ? "Activado" : "Desactivado"}</span></label>`;
    case "integer":
      return `<input class="field dash-field__input" type="number" inputmode="numeric" min="${field.min}" max="${field.max}" step="1" value="${escapeHtml(value)}" ${common} />`;
    case "enum":
      return `<select class="field dash-field__input" ${common}>${field.options
        .map((o) => option(o, o, o === value))
        .join("")}</select>`;
    case "channel_id": {
      const known = ctx.channels.some((c) => c.id === value);
      return `<select class="field dash-field__input" ${common}>${option("", "— Ninguno —", !value)}${
        value && !known ? option(value, `Canal desconocido (${value})`, true) : ""
      }${ctx.channels.map((c) => option(c.id, `#${c.name}`, c.id === value)).join("")}</select>`;
    }
    case "role_id": {
      const known = ctx.roles.some((r) => r.id === value);
      return `<select class="field dash-field__input" ${common}>${option("", "— Ninguno —", !value)}${
        value && !known ? option(value, `Rol desconocido (${value})`, true) : ""
      }${ctx.roles.map((r) => option(r.id, `@${r.name}`, r.id === value)).join("")}</select>`;
    }
    case "role_id_list": {
      const selected = new Set(value || []);
      return `<select class="field dash-field__input dash-field__multi" multiple size="${Math.min(6, Math.max(3, ctx.roles.length))}" ${common}>${ctx.roles
        .map((r) => option(r.id, `@${r.name}`, selected.has(r.id)))
        .join("")}</select>`;
    }
    case "user_id_list":
      return `<textarea class="field dash-field__input" rows="3" placeholder="Un ID de usuario por línea" ${common}>${escapeHtml(
        (value || []).join("\n"),
      )}</textarea>`;
    case "string_set": {
      const all = (value || []).includes("all");
      const items = [["all", "Todo"], ...field.options.map((o) => [o, o])];
      return `<div class="dash-chips" ${common.replace(/name="[^"]*" /, "")}>${items
        .map(
          ([v, l]) =>
            `<label class="dash-chip"><input type="checkbox" value="${escapeHtml(v)}"${
              (v === "all" ? all : !all && (value || []).includes(v)) ? " checked" : ""
            }${ctx.readOnly ? " disabled" : ""} /><span>${escapeHtml(l)}</span></label>`,
        )
        .join("")}</div>`;
    }
    default:
      return `<code>${escapeHtml(JSON.stringify(value))}</code>`;
  }
};

const renderField = (field, value, ctx) => {
  const locked = field.privileged && ctx.readOnly === false && !ctx.canPrivileged;
  return `
    <div class="dash-field${field.privileged ? " dash-field--privileged" : ""}">
      <div class="dash-field__text">
        <label class="dash-field__label" for="f-${escapeHtml(field.key)}">${escapeHtml(labelFor(field.key))}</label>
        <p class="dash-field__help">${escapeHtml(field.description)}</p>
        <p class="stat-note"><code>${escapeHtml(field.key)}</code>${field.privileged ? ' · <span class="pill pill--dark">Privilegiado</span>' : ""}</p>
      </div>
      <div class="dash-field__control">${renderControl(field, value, { ...ctx, readOnly: ctx.readOnly || locked })}</div>
    </div>`;
};

const renderSection = (category, fields, settings, ctx) => {
  const [title, help] = CATEGORY_LABELS[category] || [category, ""];
  const body = fields.map((f) => renderField(f, settings[f.key], ctx)).join("");
  if (category === "upcoming") {
    return `
      <details class="surface-card dash-section">
        <summary><span class="card-label">Sin efecto todavía</span><span class="card-title">${escapeHtml(title)}</span></summary>
        <p class="stat-note">${escapeHtml(help)}</p>
        ${body}
      </details>`;
  }
  return `
    <section class="surface-card dash-section" aria-labelledby="s-${escapeHtml(category)}">
      <p class="card-label">${escapeHtml(help)}</p>
      <h2 id="s-${escapeHtml(category)}" class="card-title">${escapeHtml(title)}</h2>
      ${body}
    </section>`;
};

const errorPage = (response, status, title, message) => {
  setHtmlSecurityHeaders(response);
  return response
    .status(status)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(
      renderPage({
        title: `${title} · Drew`,
        main: `<main><section class="page-head"><p class="eyebrow">Dashboard</p><h1 class="page-head__title">${escapeHtml(
          title,
        )}</h1><p class="page-head__copy">${escapeHtml(message)}</p><p class="dash-head__actions"><a class="cta" href="/api/auth/discord">Iniciar sesión de nuevo</a></p></section></main>`,
      }),
    );
};

module.exports = async (request, response) => {
  const guildId = String(request.query.id || "");
  const session = readSession(request);
  if (!session) {
    return response.redirect(302, "/api/auth/discord");
  }
  if (!sessionCanView(session, guildId)) {
    return errorPage(response, 403, "Sin acceso", "No gestionas este servidor, o tu sesión es anterior a cuando empezaste a gestionarlo.");
  }
  if (!isConfigured()) {
    return errorPage(response, 503, "No disponible", "La conexión con el bot no está configurada.");
  }

  let guild, settings, schema, channels, roles;
  try {
    [guild, settings, schema, channels, roles] = await Promise.all([
      getGuild(guildId, session.uid),
      getGuildSettings(guildId, session.uid),
      getSchema(),
      getGuildChannels(guildId, session.uid),
      getGuildRoles(guildId, session.uid),
    ]);
  } catch (error) {
    if (error instanceof DrewApiError && error.status === 404) {
      return errorPage(response, 404, "Drew no está aquí", "Invita a Drew a este servidor para configurarlo.");
    }
    return errorPage(response, 503, "No disponible", "No se pudo contactar con el bot. Inténtalo en unos minutos.");
  }

  const canEdit = sessionCanEdit(session, guildId);
  const ctx = {
    channels: channels.channels || [],
    roles: roles.roles || [],
    readOnly: !canEdit,
    canPrivileged: canEdit,
  };
  const values = settings.settings || {};
  const order = ["anti_nuke", "anti_raid", "blacklist", "logging", "verification", "upcoming"];
  const byCategory = new Map(order.map((c) => [c, []]));
  for (const field of schema.fields || []) {
    if (!byCategory.has(field.category)) {
      byCategory.set(field.category, []);
    }
    byCategory.get(field.category).push(field);
  }
  const sections = [...byCategory.entries()]
    .filter(([, fields]) => fields.length > 0)
    .map(([category, fields]) => renderSection(category, fields, values, ctx))
    .join("");

  // Initial values for change detection; "<" is escaped so the JSON can't
  // close the script element.
  const initial = JSON.stringify({ guild_id: guildId, settings: values }).replaceAll("<", "\\u003c");

  const main = `
    <main>
      <section class="page-head">
        <p class="eyebrow">Configuración</p>
        <h1 class="page-head__title"><span class="gradient-text">${escapeHtml(guild.name)}</span></h1>
        <p class="page-head__copy">${
          canEdit
            ? "Los cambios se validan igual que en la API pública, se registran y se avisan en tu canal de logs."
            : "Solo el dueño del servidor puede guardar cambios desde la web. Los administradores pueden usar <code>/sudo</code> en Discord o un token de <code>/api</code>."
        }</p>
        <p class="dash-head__actions">
          <a class="ghost" href="/api/auth/discord">← Mis servidores</a>
          <a class="ghost" href="/developers.html">API para desarrolladores e IAs</a>
          <a class="ghost" href="/api/auth/logout">Cerrar sesión</a>
        </p>
      </section>

      <div class="page-body">
        <form class="dash-settings" data-settings-form data-csrf="${escapeHtml(session.csrf)}" novalidate>
          ${sections}
          ${
            canEdit
              ? `<div class="surface-card dash-savebar" data-savebar>
            <p class="dash-savebar__status" data-status aria-live="polite">Sin cambios.</p>
            <div class="dash-savebar__changes" data-changes hidden></div>
            <div class="dash-savebar__actions">
              <button class="ghost" type="button" data-reset disabled>Descartar</button>
              <button class="cta" type="button" data-review disabled>Revisar cambios</button>
              <button class="cta cta--discord" type="button" data-apply hidden>Aplicar cambios</button>
            </div>
          </div>`
              : ""
          }
        </form>
      </div>
      <script type="application/json" id="drew-initial">${initial}</script>
    </main>`;

  setHtmlSecurityHeaders(response);
  return response
    .status(200)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(renderPage({ title: `${guild.name} · Drew`, main, scripts: canEdit ? ["/dashboard-settings.js"] : [] }));
};
