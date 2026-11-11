const { createOAuthState } = require("../_lib/security");

module.exports = (request, response) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return response.status(500).json({
      error: "Missing Discord OAuth environment variables.",
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    // Only what the dashboard needs: who you are and which servers you manage.
    scope: "identify guilds",
    // Binds the callback to this browser (prevents login CSRF).
    state: createOAuthState(request, response),
    prompt: "consent",
  });

  response.setHeader("Cache-Control", "no-store");
  return response.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
};
