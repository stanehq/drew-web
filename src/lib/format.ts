const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const exact = new Intl.NumberFormat("en");

export const formatCompact = (n: number) => compact.format(n);
export const formatExact = (n: number) => exact.format(n);

/** Uptime in weeks, days and hours only ("3w 2d 5h"), zero units skipped. */
export const formatUptime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds / 3600));
  const w = Math.floor(total / 168);
  const d = Math.floor((total % 168) / 24);
  const h = total % 24;
  const parts = [w && `${w}w`, d && `${d}d`, h && `${h}h`].filter(Boolean);
  return parts.length ? parts.join(" ") : "<1h";
};
