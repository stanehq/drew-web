import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 30, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Drew home">
      <span className="relative inline-flex">
        <span className="absolute inset-0 rounded-full bg-brand/30 blur-md transition-opacity group-hover:opacity-100 opacity-60" aria-hidden />
        <Image src="/brand/drew-icon.svg" unoptimized alt="" width={size} height={size} priority className="relative" />
      </span>
      {withText && <span className="text-[1.15rem] font-semibold tracking-tight text-fg">Drew</span>}
    </Link>
  );
}
