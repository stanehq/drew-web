import type { Badge } from "@/lib/public-showcase";

/**
 * Only add testimonials submitted by real users and approved for publication.
 * Keep this list empty until verified feedback is available.
 */
export type Testimonial = {
  server: { name: string; icon: string | null; members?: number; badge?: Badge | null };
  quote: string;
  author: { name: string; role: string; avatar?: string | null };
  color?: string;
};

export const TESTIMONIALS: Testimonial[] = [];
