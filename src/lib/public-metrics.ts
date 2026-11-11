import "server-only";
import { getBotMetrics, type MetricRange } from "./drew";

export type PublicMetricPoint = { t: number; guilds: number; users: number; channels: number; shardsOnline: number; shardsTotal: number; latencyMs: number; commands: number };
export type PublicMetrics = {
  available: true;
  range: MetricRange;
  from: number;
  to: number;
  stepSeconds: number;
  points: PublicMetricPoint[];
  current: {
    guilds: number;
    users: number;
    channels: number;
    shardsOnline: number;
    shardsTotal: number;
    latencyMs: number;
    commandsUsed: number;
    uptimeSeconds: number;
  };
};

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Whitelists the public aggregate fields; nothing else from the bot passes through. */
export async function getPublicMetrics(range: MetricRange): Promise<PublicMetrics> {
  const m = await getBotMetrics(range);
  return {
    available: true,
    range,
    from: n(m.from),
    to: n(m.to),
    stepSeconds: n(m.step_seconds),
    points: (Array.isArray(m.points) ? m.points : []).map((p) => ({
      t: n(p.t),
      guilds: n(p.guilds),
      users: n(p.users),
      channels: n(p.channels),
      shardsOnline: n(p.shards_online),
      shardsTotal: n(p.shards_total),
      latencyMs: n(p.latency_ms),
      commands: n(p.commands),
    })),
    current: {
      guilds: n(m.current?.guilds),
      users: n(m.current?.users),
      channels: n(m.current?.channels),
      shardsOnline: n(m.current?.shards_online),
      shardsTotal: n(m.current?.shards_total),
      latencyMs: n(m.current?.latency_ms),
      commandsUsed: n(m.current?.commands_used),
      uptimeSeconds: n(m.current?.uptime_seconds),
    },
  };
}
