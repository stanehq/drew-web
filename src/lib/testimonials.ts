import type { Badge } from "@/lib/public-showcase";

/**
 * Real quotes from server owners and staff, shown on the home page before the
 * closing card. Only add quotes you have permission to publish. While this list
 * is empty the section shows EXAMPLES instead, clearly labelled as examples.
 *
 * Images must be on cdn.discordapp.com (server icons and user avatars).
 */
export type Testimonial = {
  server: { name: string; icon: string | null; members: number; badge?: Badge | null };
  quote: string;
  author: { name: string; role: string; avatar?: string | null };
};

export const TESTIMONIALS: Testimonial[] = [];

/** Layout previews shown, labelled "Example", until real quotes are added above. */
export const EXAMPLES: Testimonial[] = [
  {
    server: { name: "Your community", icon: null, members: 120000, badge: "verified" },
    quote:
      "Someone got hold of a staff account and started deleting channels. Drew stopped it after the second one and banned them before anyone noticed. Setup took a minute.",
    author: { name: "Server owner", role: "Example review" },
  },
  {
    server: { name: "Gaming hub", icon: null, members: 34000, badge: "partnered" },
    quote: "The raid filter catches join floods instantly and the logs show exactly who changed what.",
    author: { name: "Head moderator", role: "Example review" },
  },
  {
    server: { name: "Study group", icon: null, members: 8200, badge: "community" },
    quote: "SUDO mode is the feature I didn't know I needed. Nobody can turn protection off without the owner.",
    author: { name: "Server manager", role: "Example review" },
  },
  {
    server: { name: "Creator server", icon: null, members: 61000, badge: "discoverable" },
    quote: "Verification and backups in one bot, configured from the dashboard or the API.",
    author: { name: "Administrator", role: "Example review" },
  },
];
