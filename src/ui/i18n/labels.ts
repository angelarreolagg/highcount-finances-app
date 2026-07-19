import type { TFunction } from "i18next";
import type { CardType } from "../../domain/entities/Card";
import type { SavingsEntryKind } from "../../domain/entities/SavingsEntry";

/**
 * `t`-aware label helpers (call from components with the `t` from useTranslation).
 * Default seed records (categories `cat-*`, the `account-cash` account) are stored
 * with English `name`s that stay the internal key (icon lookup / matching); these
 * helpers map their stable ids to a translated display label, falling back to the
 * raw stored name for anything user-created. Kept in a non-component file so the
 * react-refresh rule stays happy.
 */

const DEFAULT_LABEL_IDS = new Set([
  "cat-food",
  "cat-transport",
  "cat-housing",
  "cat-services",
  "cat-health",
  "cat-entertainment",
  "cat-shopping",
  "cat-other-expense",
  "cat-salary",
  "cat-other-income",
  "account-cash",
]);

/** Translated label for a default category/account by id; otherwise the stored name. */
export function seedLabel(t: TFunction, id: string | undefined, name: string): string {
  return id && DEFAULT_LABEL_IDS.has(id) ? t(`categories.${id}`) : name;
}

export function cardTypeLabel(t: TFunction, type: CardType): string {
  return t(`enums.cardType.${type}`);
}

export function savingsKindLabel(t: TFunction, kind: SavingsEntryKind): string {
  return t(`enums.savingsKind.${kind}`);
}

export function chipColorLabel(t: TFunction, color: string): string {
  return t(`enums.chipColor.${color}`);
}
