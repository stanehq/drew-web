import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
const styles: Record<Variant, string> = {
  primary:
    "bg-brand text-[#03110a] hover:bg-brand-bright shadow-[0_0_0_1px_rgb(65_207_139/0.4),0_8px_30px_-6px_rgb(65_207_139/0.55)]",
  secondary: "bg-white/[0.06] text-fg ring-1 ring-inset ring-line-strong hover:bg-white/[0.1]",
  ghost: "text-soft hover:text-fg hover:bg-white/[0.05]",
};

export function buttonClass(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md") {
  const sizes = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[0.95rem]" };
  return `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ${sizes[size]} ${styles[variant]}`;
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
