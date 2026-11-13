import Link from "@/components/locale-link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
const styles: Record<Variant, string> = {
  primary: "border border-brand bg-brand text-[#03110a] shadow-[0_5px_18px_rgba(65,207,139,0.16)] hover:border-brand-bright hover:bg-brand-bright hover:shadow-[0_7px_22px_rgba(65,207,139,0.24)]",
  secondary: "border border-line-strong bg-white/[0.06] text-fg hover:border-white/30 hover:bg-white/[0.1]",
  ghost: "border border-transparent text-soft hover:border-line hover:bg-white/[0.05] hover:text-fg",
  outline: "border border-brand/55 bg-brand/[0.07] text-brand-bright hover:border-brand hover:bg-brand/[0.14]",
};

export function buttonClass(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md") {
  const sizes = {
    sm: "h-10 rounded-md px-4 text-sm",
    md: "h-11 rounded-md px-5 text-[0.94rem]",
    lg: "h-12 rounded-md px-6 text-[0.98rem]",
  };
  return `inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${sizes[size]} ${styles[variant]}`;
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
