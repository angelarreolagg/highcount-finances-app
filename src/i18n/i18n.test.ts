import { describe, expect, it } from "vitest";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

/** Flatten a nested translation object to a set of dotted leaf keys. */
function flatten(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("i18n translations", () => {
  const enKeys = new Set(flatten(en));
  const esKeys = new Set(flatten(es));

  it("English and Spanish have identical key sets", () => {
    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
    const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));
    expect(missingInEs, "keys missing in es").toEqual([]);
    expect(missingInEn, "keys missing in en").toEqual([]);
  });

  it("covers every enum, category, and default-account label in both languages", () => {
    const required = [
      "enums.cardType.credit",
      "enums.cardType.debit",
      "enums.cardType.cash",
      "enums.savingsKind.deposit",
      "enums.savingsKind.returns",
      "enums.chipColor.indigo",
      "enums.chipColor.fuchsia",
      "categories.cat-food",
      "categories.cat-other-income",
      "categories.account-cash",
    ];
    for (const key of required) {
      expect(enKeys.has(key), `en missing ${key}`).toBe(true);
      expect(esKeys.has(key), `es missing ${key}`).toBe(true);
    }
  });
});
