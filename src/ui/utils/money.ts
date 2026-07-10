import type { Money } from "../../domain/value-objects/Money";

/** Split a formatted amount into main part + cents, for Revolut-style small decimals. */
export function splitFormattedMoney(money: Money): { main: string; cents: string | null } {
  const formatted = money.format();
  const match = formatted.match(/^(.*)\.(\d{2})$/);
  return match ? { main: match[1], cents: match[2] } : { main: formatted, cents: null };
}
