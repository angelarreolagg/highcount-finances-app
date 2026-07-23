import { US, MX } from "country-flag-icons/react/3x2";

/**
 * Country flag for a UI language. English → US, Spanish → Mexico (matches the app's es-MX / MXN
 * formatting). Purely decorative — the text label beside it carries the meaning, so it's aria-hidden.
 */
export function LanguageFlag({ lang, className }: { lang: string; className?: string }) {
  const Flag = lang === "es" ? MX : US;
  return <Flag aria-hidden className={className ?? "h-3.5 w-auto rounded-[2px] shadow-sm"} />;
}
