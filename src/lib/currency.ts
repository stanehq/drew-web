/** Currencies the pricing page can show. Prices are set in USD. */
export const CURRENCY_CODES = ["USD", "EUR", "GBP", "BRL", "MXN", "CAD", "AUD"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Used only until live rates load, or if the rates service is down. */
export const FALLBACK_RATES: Record<CurrencyCode, number> = { USD: 1, EUR: 0.92, GBP: 0.79, BRL: 5.4, MXN: 18.5, CAD: 1.38, AUD: 1.53 };

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  BRL: "Brazilian real",
  MXN: "Mexican peso",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
};
