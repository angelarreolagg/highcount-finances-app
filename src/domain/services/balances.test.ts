import { describe, expect, it } from "vitest";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { computeBalances } from "./balances";

const tx = (type: "income" | "expense", date: string, amount: string): Transaction => ({
  id: `${type}-${date}-${amount}`,
  type,
  amount: Money.from(amount),
  categoryId: "cat",
  cardId: "card",
  date,
  description: "test",
});

describe("computeBalances", () => {
  const today = new Date(2026, 6, 9); // July 9, 2026

  it("separates expenses to date from committed future installments", () => {
    const balances = computeBalances(
      [
        tx("income", "2026-06-15", "10000"),
        tx("expense", "2026-07-01", "1000"), // already happened
        tx("expense", "2026-08-01", "500"), // future MSI installment
        tx("expense", "2026-09-01", "500"), // future MSI installment
      ],
      today,
    );
    expect(balances.totalIncome.toStorage()).toBe("10000");
    expect(balances.totalExpensesToDate.toStorage()).toBe("1000");
    expect(balances.totalCommittedExpenses.toStorage()).toBe("2000");
    expect(balances.currentBalance.toStorage()).toBe("9000");
    expect(balances.realBalance.toStorage()).toBe("8000");
  });

  it("includes transactions dated exactly today, excludes future income", () => {
    const balances = computeBalances(
      [
        tx("income", "2026-07-09", "100"),
        tx("expense", "2026-07-09", "40"),
        tx("income", "2026-07-10", "999"), // tomorrow — not yet real money
      ],
      today,
    );
    expect(balances.totalIncome.toStorage()).toBe("100");
    expect(balances.totalExpensesToDate.toStorage()).toBe("40");
    expect(balances.currentBalance.toStorage()).toBe("60");
  });

  it("is all zeros with no transactions", () => {
    const balances = computeBalances([], today);
    expect(balances.currentBalance.isZero()).toBe(true);
    expect(balances.realBalance.isZero()).toBe(true);
  });

  it("excludes income on a credit card (a card payment, not cash income)", () => {
    const transactions = [
      { ...tx("income", "2026-06-15", "3000"), cardId: "debit-1" },
      { ...tx("income", "2026-06-16", "2000"), cardId: "credit-1" }, // payment to a credit card
    ];
    const balances = computeBalances(transactions, today, new Set(["credit-1"]));
    // Only the debit income counts toward cash income.
    expect(balances.totalIncome.toStorage()).toBe("3000");
    expect(balances.currentBalance.toStorage()).toBe("3000");
  });
});
