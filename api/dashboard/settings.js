// Applies a settings change from the dashboard by forwarding it to the
// public configuration API (PATCH /guilds/{id}/settings) for the logged-in
// owner. Validation, audit and log-channel notices happen in the bot, the
// same as for API tokens.

const { isConfigured, patchGuildSettings } = require("../_lib/drew");
const { isSameOriginWrite, readSession, sessionCanEdit } = require("../_lib/security");

const MAX_BODY_BYTES = 64 * 1024;

const fail = (response, status, code, message) =>
  response.status(status).json({ error: { code, message } });

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error("too large");
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

module.exports = async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return fail(response, 405, "METHOD_NOT_ALLOWED", "Use POST");
  }

  const session = readSession(request);
  if (!session) {
    return fail(response, 401, "SESSION_EXPIRED", "Tu sesión ha caducado. Vuelve a iniciar sesión.");
  }
  if (!isSameOriginWrite(request, session)) {
    return fail(response, 403, "CSRF", "Petición rechazada por seguridad. Recarga la página.");
  }
  if (!String(request.headers["content-type"] || "").startsWith("application/json")) {
    return fail(response, 415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    return fail(response, 400, "INVALID_BODY", "Cuerpo JSON no válido");
  }
  const guildId = String(body?.guild_id || "");
  const settings = body?.settings;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return fail(response, 422, "INVALID_BODY", "Faltan los ajustes");
  }
  if (!sessionCanEdit(session, guildId)) {
    return fail(response, 403, "OWNER_ONLY", "Solo el dueño del servidor puede guardar cambios desde la web.");
  }
  if (!isConfigured()) {
    return fail(response, 503, "UNAVAILABLE", "La conexión con el bot no está configurada.");
  }

  try {
    const result = await patchGuildSettings(guildId, session.uid, settings, body.dry_run === true);
    return response.status(result.status).json(result.body);
  } catch {
    return fail(response, 502, "BOT_UNAVAILABLE", "No se pudo contactar con el bot. Inténtalo de nuevo.");
  }
};
