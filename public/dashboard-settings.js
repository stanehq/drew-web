// Dashboard settings editor: collects changed fields, previews them with a
// dry run against the bot API and applies them on confirmation.
(() => {
  const form = document.querySelector("[data-settings-form]");
  const initialEl = document.getElementById("drew-initial");
  if (!form || !initialEl) {
    return;
  }

  const initial = JSON.parse(initialEl.textContent);
  let baseline = initial.settings;
  const guildId = initial.guild_id;
  const csrf = form.dataset.csrf;

  const statusEl = form.querySelector("[data-status]");
  const changesEl = form.querySelector("[data-changes]");
  const resetBtn = form.querySelector("[data-reset]");
  const reviewBtn = form.querySelector("[data-review]");
  const applyBtn = form.querySelector("[data-apply]");

  const controls = [...form.querySelectorAll("[data-key]")];

  const readValue = (el) => {
    switch (el.dataset.type) {
      case "boolean":
        return el.checked;
      case "integer":
        return el.value === "" ? null : Number(el.value);
      case "channel_id":
      case "role_id":
        return el.value || null;
      case "role_id_list":
        return [...el.selectedOptions].map((o) => o.value);
      case "user_id_list":
        return el.value
          .split(/[\s,]+/)
          .map((v) => v.trim())
          .filter(Boolean);
      case "string_set": {
        const checked = [...el.querySelectorAll("input:checked")].map((i) => i.value);
        return checked.includes("all") || checked.length === 0 ? ["all"] : checked;
      }
      default:
        return el.value;
    }
  };

  const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

  const pending = () => {
    const out = {};
    for (const el of controls) {
      const value = readValue(el);
      if (!same(value, baseline[el.dataset.key])) {
        out[el.dataset.key] = value;
      }
    }
    return out;
  };

  // Show channel and role names instead of raw IDs where the form knows them.
  const labelFor = (key, id) => {
    const el = form.querySelector(`[data-key="${CSS.escape(key)}"]`);
    const opt = el && el.tagName === "SELECT" ? [...el.options].find((o) => o.value === id) : null;
    return opt ? opt.textContent : id;
  };

  const formatFor = (key, value) => {
    if (Array.isArray(value)) {
      return value.length ? value.map((v) => labelFor(key, v)).join(", ") : "—";
    }
    if (typeof value === "string" && /^\d{17,20}$/.test(value)) {
      return labelFor(key, value);
    }
    return format(value);
  };

  const format = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "—";
    }
    if (typeof value === "boolean") {
      return value ? "activado" : "desactivado";
    }
    return String(value);
  };

  const renderList = (entries) => {
    changesEl.replaceChildren(
      ...entries.map(([key, text, isError]) => {
        const row = document.createElement("p");
        row.className = isError ? "dash-change dash-change--error" : "dash-change";
        const code = document.createElement("code");
        code.textContent = key;
        row.append(code, document.createTextNode(` ${text}`));
        return row;
      }),
    );
    changesEl.hidden = entries.length === 0;
  };

  const setStatus = (text, tone) => {
    statusEl.textContent = text;
    statusEl.dataset.tone = tone || "";
  };

  const refresh = () => {
    const count = Object.keys(pending()).length;
    resetBtn.disabled = count === 0;
    reviewBtn.disabled = count === 0;
    applyBtn.hidden = true;
    renderList([]);
    setStatus(count ? `${count} cambio(s) sin guardar.` : "Sin cambios.");
  };

  const send = async (dryRun) => {
    const response = await fetch("/api/dashboard/settings", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Drew-CSRF": csrf },
      body: JSON.stringify({ guild_id: guildId, settings: pending(), dry_run: dryRun }),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  };

  const showErrors = (data) => {
    const fields = data?.error?.fields || [];
    if (fields.length) {
      renderList(fields.map((f) => [f.key || "general", `— ${f.message}`, true]));
    }
    setStatus(data?.error?.message || "No se pudieron validar los cambios.", "error");
  };

  // Live label updates and "all" exclusivity.
  form.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches(".dash-toggle input")) {
      target.nextElementSibling.textContent = target.checked ? "Activado" : "Desactivado";
    }
    const chips = target.closest(".dash-chips");
    if (chips && target.checked) {
      for (const input of chips.querySelectorAll("input")) {
        if (target.value === "all" ? input !== target : input.value === "all") {
          input.checked = false;
        }
      }
    }
    refresh();
  });
  form.addEventListener("input", refresh);

  resetBtn.addEventListener("click", () => window.location.reload());

  reviewBtn.addEventListener("click", async () => {
    reviewBtn.disabled = true;
    setStatus("Validando…");
    try {
      const { ok, data } = await send(true);
      if (!ok) {
        showErrors(data);
        return;
      }
      const changes = Object.entries(data.changes || {});
      if (!changes.length) {
        setStatus("Nada que cambiar: los valores ya eran esos.");
        return;
      }
      renderList(changes.map(([key, c]) => [key, `${formatFor(key, c.old)} → ${formatFor(key, c.new)}`]));
      setStatus("Revisa los cambios y pulsa Aplicar.");
      applyBtn.hidden = false;
    } catch {
      setStatus("No se pudo contactar con el servidor.", "error");
    } finally {
      reviewBtn.disabled = Object.keys(pending()).length === 0;
    }
  });

  applyBtn.addEventListener("click", async () => {
    applyBtn.disabled = true;
    setStatus("Guardando…");
    try {
      const { ok, data } = await send(false);
      if (!ok) {
        showErrors(data);
        return;
      }
      baseline = data.settings || baseline;
      applyBtn.hidden = true;
      renderList([]);
      setStatus(`Guardado. ${Object.keys(data.changes || {}).length} cambio(s) aplicados y registrados.`, "ok");
      resetBtn.disabled = true;
      reviewBtn.disabled = true;
    } catch {
      setStatus("No se pudo contactar con el servidor.", "error");
    } finally {
      applyBtn.disabled = false;
    }
  });

  refresh();
})();
