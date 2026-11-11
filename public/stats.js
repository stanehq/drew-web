// Fills the landing page "Drew right now" section with live data from
// /api/stats. The section stays hidden if the bot API is unavailable.
(() => {
  const section = document.querySelector("[data-live-stats]");
  if (!section) {
    return;
  }

  const compact = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatters = {
    guilds: (value) => compact.format(value),
    users: (value) => compact.format(value),
    commandsUsed: (value) => compact.format(value),
    uptimeSeconds: formatUptime,
  };

  const render = (stats) => {
    for (const [key, format] of Object.entries(formatters)) {
      const element = section.querySelector(`[data-stat="${key}"]`);
      if (element) {
        element.textContent = format(Number(stats[key]) || 0);
      }
    }

    const latency = section.querySelector('[data-stat="latencyMs"]');
    const dot = section.querySelector("[data-stat-status]");
    if (latency) {
      latency.textContent = stats.ready
        ? `Online · ${stats.latencyMs}ms gateway latency`
        : "Connecting to Discord…";
    }
    if (dot) {
      dot.classList.toggle("is-online", Boolean(stats.ready));
      dot.classList.toggle("is-connecting", !stats.ready);
    }

    section.hidden = false;
  };

  const load = async () => {
    try {
      const response = await fetch("/api/stats", { headers: { Accept: "application/json" } });
      if (!response.ok) {
        return;
      }
      const stats = await response.json();
      if (stats && stats.available) {
        render(stats);
      }
    } catch (_error) {
      // Keep the section hidden when stats can't be loaded.
    }
  };

  load();
  setInterval(load, 60_000);
})();
