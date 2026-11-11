import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
const styles: Record<Variant, string> = {
  primary: "bg-brand text-[#03110a] hover:bg-brand-bright",
  secondary: "bg-transparent text-fg ring-1 ring-inset ring-white/20 hover:bg-white/[0.06] hover:ring-white/35",
  ghost: "text-soft hover:text-fg hover:bg-white/[0.05]",
  outline: "bg-brand/[0.08] text-brand-bright ring-1 ring-inset ring-brand/50 hover:bg-brand/[0.16] hover:ring-brand",
};

export function buttonClass(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md") {
  const sizes = { sm: "h-9 px-3.5 text-sm", md: "h-10 px-4 text-[0.92rem]", lg: "h-12 px-6 text-[0.98rem]" };
  return `inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ${sizes[size]} ${styles[variant]}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  external,
  className = "",
  ...rest
}: { href: string; children: ReactNode; variant?: Variant; size?: "sm" | "md" | "lg"; external?: boolean } & Omit<
  ComponentProps<"a">,
  "href"
>) {
  const cls = `${buttonClass(variant, size)} ${className}`;
  if (external || href.startsWith("/api/")) {
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
