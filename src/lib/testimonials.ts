import type { Badge } from "@/lib/public-showcase";

/**
 * Illustrative draft copy for the homepage layout. These are not real customer
 * reviews and must remain visibly labelled as examples until replaced with
 * quotes submitted by users and approved for publication.
 *
 * Images must be on cdn.discordapp.com (server icons and user avatars).
 */
export type Testimonial = {
  server: { name: string; icon: string | null; members?: number; badge?: Badge | null };
  quote: string;
  author: { name: string; role: string; avatar?: string | null };
  /** Card glow colour. Defaults to the colour of the server's badge. */
  color?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    server: { name: "Gaming community", icon: null },
    quote: "I want anti-raid protection, verification and moderation tools working together, without having to stitch several bots into one setup.",
    author: { name: "Community owner", role: "Illustrative example" },
    color: "#2563eb",
  },
  {
    server: { name: "Study community", icon: null },
    quote: "When something changes, the moderation team needs a clear record of what happened. An audit trail makes that work easier to follow.",
    author: { name: "Moderation lead", role: "Illustrative example" },
    color: "#7c3aed",
  },
  {
    server: { name: "Creator community", icon: null },
    quote: "Getting the core protections configured quickly matters. The team can start with the essentials and refine the setup as the community grows.",
    author: { name: "Server administrator", role: "Illustrative example" },
    color: "#0f766e",
  },
  {
    server: { name: "Support community", icon: null },
    quote: "For teams that prefer automation, a scoped configuration API can make repeatable changes easier to manage and review.",
    author: { name: "Technical moderator", role: "Illustrative example" },
    color: "#b45309",
  },
];
