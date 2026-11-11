import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 30, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Drew home">
      <Image src="/brand/drew-icon.svg" unoptimized alt="" width={size} height={size} priority />
      {withText && <span className="font-display text-[1.3rem] font-semibold tracking-[-0.02em] text-fg">Drew</span>}
    </Link>
  );
}
