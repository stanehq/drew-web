import type { Badge } from "@/lib/public-showcase";

/**
 * Real quotes from server owners and staff, shown on the home page before the
 * closing card. Only add quotes you have permission to publish. While this list
 * is empty the section shows EXAMPLES (lorem ipsum placeholders) instead.
 *
 * Images must be on cdn.discordapp.com (server icons and user avatars).
 */
export type Testimonial = {
  server: { name: string; icon: string | null; members: number; badge?: Badge | null };
  quote: string;
  author: { name: string; role: string; avatar?: string | null };
  /** Card glow colour. Defaults to the colour of the server's badge. */
  color?: string;
};

export const TESTIMONIALS: Testimonial[] = [];

/** Lorem ipsum placeholders shown until real quotes are added above. */
export const EXAMPLES: Testimonial[] = [
  {
    server: { name: "Your community", icon: null, members: 120000, badge: "verified" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    author: { name: "Alex", role: "Server owner" },
    color: "#3b82f6",
  },
  {
    server: { name: "Gaming hub", icon: null, members: 34000, badge: "partnered" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero.",
    author: { name: "Sam", role: "Head moderator" },
    color: "#f97316",
  },
  {
    server: { name: "Study group", icon: null, members: 8200, badge: "community" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in libero.",
    author: { name: "Jordan", role: "Server manager" },
    color: "#a855f7",
  },
  {
    server: { name: "Creator server", icon: null, members: 61000, badge: "discoverable" },
    quote: "Lorem ipsum dolor sit amet, sed cursus ante dapibus diam.",
    author: { name: "Riley", role: "Administrator" },
    color: "#14b8a6",
  },
];
