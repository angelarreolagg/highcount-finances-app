import { describe, expect, it } from "vitest";
import type { Card } from "../entities/Card";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { computeCreditUsage } from "./creditAvailability";

const creditCard = (creditLimit?: string): Card => ({
  id: "card-1",
  name: "BBVA",
  type: "credit",
  cutDay: 5,
  paymentDueDay: 20,
  ...(creditLimit ? { creditLimit: Money.from(creditLimit) } : {}),
});

const tx = (
  type: "income" | "expense",
  amount: string,
  cardId = "card-1",
  date = "2026-07-01",
): Transaction => ({
  id: `${type}-${amount}-${cardId}-${date}`,
  type,
  amount: Money.from(amount),
  categoryId: "cat",
  cardId,
  date,
  description: "test",
});

describe("computeCreditUsage", () => {
  it("returns null for a non-credit card", () => {
    const debit: Card = { id: "d", name: "Cash", type: "debit" };
    expect(computeCreditUsage(debit, [])).toBeNull();
  });

  it("returns null for a credit card with no limit set", () => {
    expect(computeCreditUsage(creditCard(), [tx("expense", "100")])).toBeNull();
  });

  it("used = expenses − income (payments), available = limit − used", () => {
    const usage = computeCreditUsage(creditCard("10000"), [
      tx("expense", "3000"),
      tx("expense", "1500"),
      tx("income", "2000"), // a payment — frees credit
    ]);
    expect(usage).not.toBeNull();
    expect(usage!.used.toStorage()).toBe("2500");
    expect(usage!.available.toStorage()).toBe("7500");
  });

  it("includes future-dated MSI installments (no date gate)", () => {
    const usage = computeCreditUsage(creditCard("10000"), [
      tx("expense", "500", "card-1", "2026-08-01"),
      tx("expense", "500", "card-1", "2027-01-01"),
    ]);
    expect(usage!.used.toStorage()).toBe("1000");
    expect(usage!.available.toStorage()).toBe("9000");
  });

  it("ignores transactions on other cards", () => {
    const usage = computeCreditUsage(creditCard("10000"), [
      tx("expense", "3000", "card-1"),
      tx("expense", "9999", "other-card"),
    ]);
    expect(usage!.used.toStorage()).toBe("3000");
  });

  it("available goes negative when over the limit", () => {
    const usage = computeCreditUsage(creditCard("1000"), [tx("expense", "1500")]);
    expect(usage!.available.isNegative()).toBe(true);
    expect(usage!.available.toStorage()).toBe("-500");
  });
});
