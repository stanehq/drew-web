"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
] as const;
export type Locale = (typeof LOCALES)[number]["code"];

const messages: Record<Locale, Record<string, string>> = {
  en: { features:"Features", pricing:"Pricing", status:"Status", metrics:"Metrics", docs:"Docs", dashboard:"Dashboard", invite:"Add to Discord", support:"Join support", topgg:"Vote for Drew on Top.gg", topggDescription:"Support Drew and help more Discord communities discover it.", trustpilot:"Trustpilot", trustpilotPending:"Official profile not connected yet", language:"Language" },
  es: { features:"Funciones", pricing:"Precios", status:"Estado", metrics:"Métricas", docs:"Documentación", dashboard:"Panel", invite:"Añadir a Discord", support:"Unirse al soporte", topgg:"Vota por Drew en Top.gg", topggDescription:"Apoya a Drew y ayuda a más comunidades de Discord a descubrirlo.", trustpilot:"Trustpilot", trustpilotPending:"El perfil oficial todavía no está conectado", language:"Idioma" },
  pt: { features:"Funcionalidades", pricing:"Preços", status:"Estado", metrics:"Métricas", docs:"Documentação", dashboard:"Painel", invite:"Adicionar ao Discord", support:"Entrar no suporte", topgg:"Vote no Drew no Top.gg", topggDescription:"Apoie o Drew e ajude mais comunidades Discord a descobri-lo.", trustpilot:"Trustpilot", trustpilotPending:"O perfil oficial ainda não está ligado", language:"Idioma" },
  fr: { features:"Fonctionnalités", pricing:"Tarifs", status:"État", metrics:"Statistiques", docs:"Documentation", dashboard:"Tableau de bord", invite:"Ajouter à Discord", support:"Rejoindre le support", topgg:"Votez pour Drew sur Top.gg", topggDescription:"Soutenez Drew et aidez d'autres communautés Discord à le découvrir.", trustpilot:"Trustpilot", trustpilotPending:"Le profil officiel n'est pas encore connecté", language:"Langue" },
  de: { features:"Funktionen", pricing:"Preise", status:"Status", metrics:"Metriken", docs:"Dokumentation", dashboard:"Dashboard", invite:"Zu Discord hinzufügen", support:"Support beitreten", topgg:"Stimme auf Top.gg für Drew ab", topggDescription:"Unterstütze Drew und hilf weiteren Discord-Communities, ihn zu entdecken.", trustpilot:"Trustpilot", trustpilotPending:"Offizielles Profil noch nicht verbunden", language:"Sprache" },
  ru: { features:"Возможности", pricing:"Цены", status:"Статус", metrics:"Метрики", docs:"Документация", dashboard:"Панель", invite:"Добавить в Discord", support:"Сервер поддержки", topgg:"Голосовать за Drew на Top.gg", topggDescription:"Поддержите Drew и помогите другим сообществам Discord узнать о нём.", trustpilot:"Trustpilot", trustpilotPending:"Официальный профиль пока не подключён", language:"Язык" },
};
type I18nContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const saved = localStorage.getItem("drew-locale");
    const browser = navigator.language.slice(0, 2);
    const supported = LOCALES.some((item) => item.code === saved);
    const detected = LOCALES.some((item) => item.code === browser) ? browser as Locale : "en";
    const next = supported ? saved as Locale : detected;
    Promise.resolve().then(() => setLocaleState(next));
    document.documentElement.lang = next;
  }, []);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("drew-locale", next);
    document.documentElement.lang = next;
  };
  const value = useMemo(() => ({ locale, setLocale, t: (key: string) => messages[locale][key] ?? messages.en[key] ?? key }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
