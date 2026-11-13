import { Badge as BadgeShape, Check, Compass, House, Infinity } from "lucide-react";
import type { Badge } from "@/lib/public-showcase";

// Discord-style server badges: a filled rosette with a white glyph.
const BADGE: Record<Badge, { color: string; Icon: typeof Check; label: string }> = {
  verified: { color: "#23a55a", Icon: Check, label: "Verified" },
  partnered: { color: "#5865f2", Icon: Infinity, label: "Discord Partner" },
  discoverable: { color: "#eb459e", Icon: Compass, label: "Discoverable" },
  community: { color: "#eb459e", Icon: House, label: "Community" },
};

export function ServerBadge({ badge }: { badge: Badge }) {
  const { color, Icon, label } = BADGE[badge];
  return (
    <span className="relative inline-flex size-[22px] shrink-0 items-center justify-center" title={label} aria-label={label} role="img">
      <BadgeShape className="absolute inset-0 size-full" fill={color} strokeWidth={0} />
      <Icon className="relative size-3 text-white" strokeWidth={3} />
    </span>
  );
}

