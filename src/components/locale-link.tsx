"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/lib/i18n";
import { localizePath } from "@/lib/locales";

/** next/link that keeps the current language prefix (/es/..., /fr/...). */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { locale } = useI18n();
  return <NextLink href={typeof href === "string" ? localizePath(href, locale) : href} {...rest} />;
}
