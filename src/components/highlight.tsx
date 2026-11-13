import { Fragment } from "react";

// Key terms shown in Drew green inside running text, in every locale.
const KEYWORDS =
  /(\b5\s?(?:days?|días|dias|jours|Tage|дней)\b|\b14[\s-]?(?:day|días|dias|jours|Tage|дней)\w*|Premium|PayPal|crypto\w*|cripto\w*|krypto\w*|крипто\w*|Apple Pay|Google Pay|\bfree\b|gratis|grátis|gratuit\w*|kostenlos|бесплатно|pay nothing|no pagas nada|Purchase Terms|Términos de compra|downgrade|upgrade|Mejora|Unlimited|Ilimitado|Priority|Prioritario|Extended|Ampliado)/gi;

export function Highlight({ text, className = "font-medium text-brand-bright" }: { text: string; className?: string }) {
  const parts = text.split(KEYWORDS);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
