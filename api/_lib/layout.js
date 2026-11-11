// Shared page shell for server-rendered pages (same header and footer as
// the static site).

const HEADER = `    <header class="topbar">
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
    </header>`;

const FOOTER = `    <footer class="footer">
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
          <li><a href="/developers.html">API</a></li>
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
    </footer>`;

const renderPage = ({ title, main, scripts = [] }) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
    <script defer src="/theme.js"></script>
${scripts.map((src) => `    <script defer src="${src}"></script>`).join("\n")}
  </head>
  <body>
${HEADER}

${main}

${FOOTER}
  </body>
</html>`;

module.exports = { renderPage };
