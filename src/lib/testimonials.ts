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

/** Placeholder (lorem ipsum) previews shown, labelled "Example", until real quotes are added above. */
export const EXAMPLES: Testimonial[] = [
  {
    server: { name: "Your community", icon: null, members: 120000, badge: "verified" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    author: { name: "Server owner", role: "Example review" },
  },
  {
    server: { name: "Gaming hub", icon: null, members: 34000, badge: "partnered" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero.",
    author: { name: "Head moderator", role: "Example review" },
  },
  {
    server: { name: "Study group", icon: null, members: 8200, badge: "community" },
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in libero.",
    author: { name: "Server manager", role: "Example review" },
  },
  {
    server: { name: "Creator server", icon: null, members: 61000, badge: "discoverable" },
    quote: "Lorem ipsum dolor sit amet, sed cursus ante dapibus diam.",
    author: { name: "Administrator", role: "Example review" },
  },
];
