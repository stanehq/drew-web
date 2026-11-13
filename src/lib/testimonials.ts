import type { Badge } from "@/lib/public-showcase";

/**
 * Real quotes from server owners and staff, shown on the home page before the
 * closing card. Only add quotes you have permission to publish. The section is
 * hidden while this list is empty.
 *
 * Images must be on cdn.discordapp.com (server icons and user avatars).
 */
export type Testimonial = {
  server: { name: string; icon: string | null; members: number; badge?: Badge | null };
  quote: string;
  author: { name: string; role: string; avatar?: string | null };
};

export const TESTIMONIALS: Testimonial[] = [];
