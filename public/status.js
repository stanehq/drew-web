// Live status page: polls /api/status and renders the overall banner,
// summary, services and shard grid. Also maps a server ID to its shard
// using Discord's sharding formula: (guild_id >> 22) % shard_count.
(() => {
  const root = document.querySelector("[data-status-root]");
  if (!root) {
    return;
  }

  const REFRESH_SECONDS = 30;
  const $ = (selector) => root.querySelector(selector);

  const exact = new Intl.NumberFormat("en");
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

  const SERVICE_LABELS = {
    gateway: "Discord gateway",
    api: "API",
    database: "Database",
    cache: "Cache",
  };
  const SERVICE_ORDER = ["gateway", "api", "database", "cache"];
  const STATE_TEXT = {
    operational: "Operational",
    degraded: "Degraded",
    down: "Down",
    not_configured: "Not configured",
    online: "Online",
    connecting: "Connecting",
    offline: "Offline",
  };

  let state = null;
  let countdown = REFRESH_SECONDS;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  };

  const dot = (status) => {
    const node = el("span", `status-dot is-${status}`);
    node.setAttribute("aria-hidden", "true");
    return node;
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const shardForGuild = (guildId, shardCount) => {
    if (!/^\d{17,20}$/.test(guildId) || shardCount < 1) {
      return null;
    }
    return Number((BigInt(guildId) >> 22n) % BigInt(shardCount));
  };

  const lookupShard = () => {
    const input = $("[data-lookup-input]");
    const result = $("[data-lookup-result]");
    const value = input.value.trim();

    root.querySelectorAll(".status-shard--highlight").forEach((card) => {
      card.classList.remove("status-shard--highlight");
    });
    result.classList.remove("status-lookup__result--error");

    if (!value) {
      result.textContent = "";
      return;
    }
    if (!state) {
      result.textContent = "Waiting for status data…";
      return;
    }

    const shardId = shardForGuild(value, state.shardCount);
    if (shardId === null) {
      result.textContent = "That doesn't look like a valid server ID.";
      result.classList.add("status-lookup__result--error");
      return;
    }

    const shard = state.shards.find((s) => s.id === shardId);
    const statusText = shard ? STATE_TEXT[shard.status].toLowerCase() : "unknown";
    result.textContent = `Your server is on shard ${shardId} (${statusText}).`;

    const card = root.querySelector(`[data-shard-id="${shardId}"]`);
    if (card) {
      card.classList.add("status-shard--highlight");
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const renderOverall = (data) => {
    const online = data.shards.filter((s) => s.status === "online").length;
    const servicesDown = Object.values(data.services).filter((s) => s.status === "down").length;
    const total = data.shards.length;

    let overall = "operational";
    let title = "Drew is fully operational";
    if (total === 0 || online === 0) {
      overall = "down";
      title = "Drew is offline";
    } else if (online < total || servicesDown > 0 || !data.ready) {
      overall = "degraded";
      title = "Drew is partially degraded";
    }

    const heading = $("[data-overall-title]");
    heading.replaceChildren(dot(overall), document.createTextNode(title));

    const bar = $("[data-shard-bar]");
    bar.replaceChildren(
      ...data.shards.map((shard) => {
        const segment = el("span", `status-bar__segment is-${shard.status}`);
        segment.title = `Shard ${shard.id}: ${STATE_TEXT[shard.status]}`;
        return segment;
      }),
    );
    bar.setAttribute("aria-label", `${online} of ${total} shards online`);
    $("[data-bar-first]").textContent = total ? `Shard ${data.shards[0].id}` : "";
    $("[data-bar-last]").textContent = total > 1 ? `Shard ${data.shards[total - 1].id}` : "";
  };

  const renderSummary = (data) => {
    const online = data.shards.filter((s) => s.status === "online");
    const latencies = online.map((s) => s.latencyMs);

    $('[data-summary="guilds"]').textContent = exact.format(data.guilds);
    $('[data-summary="guildsNote"]').textContent =
      `across ${data.shardCount} shard${data.shardCount === 1 ? "" : "s"}`;
    $('[data-summary="users"]').textContent = compact.format(data.users);

    const shardsValue = $('[data-summary="shards"]');
    shardsValue.replaceChildren(
      document.createTextNode(String(online.length)),
      el("small", "", ` / ${data.shards.length}`),
    );
    $('[data-summary="uptime"]').textContent = `up ${formatUptime(data.uptimeSeconds)}`;

    $('[data-summary="latency"]').textContent = `${data.latencyMs}ms`;
    $('[data-summary="latencyNote"]').textContent = latencies.length
      ? `${Math.min(...latencies)}ms fastest, ${Math.max(...latencies)}ms slowest`
      : "no shards connected";
  };

  const renderServices = (data) => {
    const names = [
      ...SERVICE_ORDER.filter((name) => data.services[name]),
      ...Object.keys(data.services).filter((name) => !SERVICE_ORDER.includes(name)),
    ];

    $("[data-services]").replaceChildren(
      ...names.map((name) => {
        const info = data.services[name];
        const item = el("li", "status-service");
        item.append(el("span", "status-service__name", SERVICE_LABELS[name] || name));

        const right = el("span", "status-service__state");
        let detail = STATE_TEXT[info.status] || info.status;
        if (info.status === "operational" && info.latencyMs > 0) {
          detail += ` · ${info.latencyMs}ms`;
        }
        right.append(el("span", "status-muted", detail), dot(info.status));
        item.append(right);
        return item;
      }),
    );
  };

  const renderShards = (data) => {
    $("[data-shards]").replaceChildren(
      ...data.shards.map((shard) => {
        const card = el("article", "status-shard");
        card.dataset.shardId = String(shard.id);

        const head = el("div", "status-shard__head");
        head.append(el("span", "", `Shard ${shard.id}`), dot(shard.status));
        const meta = el("div", "status-shard__meta");

        const latency = el("span");
        latency.append(
          el("strong", "", shard.status === "online" ? `${shard.latencyMs}ms` : STATE_TEXT[shard.status]),
        );
        const servers = el("span");
        servers.append(el("strong", "", exact.format(shard.guilds)), document.createTextNode(" servers"));
        const members = el("span");
        members.append(el("strong", "", compact.format(shard.users)), document.createTextNode(" members"));
        meta.append(latency, servers, members);
        card.append(head, meta);
        card.setAttribute(
          "aria-label",
          `Shard ${shard.id}, ${STATE_TEXT[shard.status]}, ${shard.guilds} servers`,
        );
        return card;
      }),
    );
  };

  const load = async () => {
    try {
      const response = await fetch("/api/status", { headers: { Accept: "application/json" } });
      const data = response.ok ? await response.json() : null;
      if (!data || !data.available) {
        throw new Error("unavailable");
      }
      state = data;
      renderOverall(data);
      renderSummary(data);
      renderServices(data);
      renderShards(data);
      $("[data-status-error]").hidden = true;
      lookupShard();
    } catch (_error) {
      $("[data-status-error]").hidden = false;
      if (!state) {
        $("[data-overall-title]").replaceChildren(
          dot("down"),
          document.createTextNode("Status unavailable"),
        );
      }
    }
  };

  const tick = () => {
    countdown -= 1;
    if (countdown <= 0) {
      countdown = REFRESH_SECONDS;
      load();
    }
    $("[data-refresh]").textContent = `Refreshing in ${countdown}s`;
  };

  $("[data-lookup-form]").addEventListener("submit", (event) => event.preventDefault());
  $("[data-lookup-input]").addEventListener("input", lookupShard);

  const initial = new URLSearchParams(location.search).get("server");
  if (initial) {
    $("[data-lookup-input]").value = initial;
  }

  $("[data-refresh]").textContent = `Refreshing in ${countdown}s`;
  load();
  setInterval(tick, 1000);
})();
