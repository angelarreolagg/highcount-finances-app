import { describe, expect, it } from "vitest";
import type { Card } from "../entities/Card";
import type { Category } from "../entities/Category";
import type { SavingsEntry } from "../entities/SavingsEntry";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { buildAnnualSummary, isAnnualSummaryUnlocked } from "./annualSummary";

describe("isAnnualSummaryUnlocked", () => {
  it("unlocks the current year on December 15th", () => {
    expect(isAnnualSummaryUnlocked(2026, new Date(2026, 11, 14))).toBe(false);
    expect(isAnnualSummaryUnlocked(2026, new Date(2026, 11, 15))).toBe(true);
    expect(isAnnualSummaryUnlocked(2026, new Date(2026, 11, 31))).toBe(true);
  });

  it("always unlocks past years and never future years", () => {
    expect(isAnnualSummaryUnlocked(2025, new Date(2026, 0, 1))).toBe(true);
    expect(isAnnualSummaryUnlocked(2027, new Date(2026, 11, 31))).toBe(false);
  });
});

describe("buildAnnualSummary", () => {
  const categories: Category[] = [
    { id: "cat-food", name: "Food", kind: "expense" },
    { id: "cat-housing", name: "Housing", kind: "expense" },
    { id: "cat-salary", name: "Salary", kind: "income" },
  ];
  const cards: Card[] = [
    { id: "card-1", name: "Visa", type: "credit", cutDay: 28, paymentDueDay: 17 },
    { id: "cash", name: "Cash", type: "cash" },
  ];
  const tx = (
    type: "income" | "expense",
    date: string,
    amount: string,
    categoryId: string,
    cardId: string,
  ): Transaction => ({
    id: `${type}-${date}-${amount}`,
    type,
    amount: Money.from(amount),
    categoryId,
    cardId,
    date,
    description: "test",
  });
  const savings: SavingsEntry[] = [
    { id: "s1", date: "2026-01-10", balance: Money.from("10000") },
    { id: "s2", date: "2026-06-10", balance: Money.from("12500") },
    { id: "s0", date: "2025-12-10", balance: Money.from("9000") }, // other year, ignored
  ];

  const summary = buildAnnualSummary(
    2026,
    [
      tx("income", "2026-01-15", "2000", "cat-salary", "cash"),
      tx("income", "2026-02-15", "2000", "cat-salary", "cash"),
      tx("expense", "2026-01-20", "300.50", "cat-food", "card-1"),
      tx("expense", "2026-02-05", "1200", "cat-housing", "cash"),
      tx("expense", "2026-02-06", "99.50", "cat-food", "card-1"),
    ],
    savings,
    categories,
    cards,
  );

  it("totals income and expenses with exact decimal math", () => {
    expect(summary.totalIncome.toStorage()).toBe("4000");
    expect(summary.totalExpenses.toStorage()).toBe("1600");
    expect(summary.net.toStorage()).toBe("2400");
    expect(summary.transactionCount).toBe(5);
  });

  it("finds the largest expense", () => {
    expect(summary.largestExpense?.amount.toStorage()).toBe("1200");
    expect(summary.largestExpense?.categoryId).toBe("cat-housing");
  });

  it("breaks expenses down by category and card, sorted descending", () => {
    expect(summary.expensesByCategory.map((c) => c.categoryName)).toEqual(["Housing", "Food"]);
    expect(summary.expensesByCategory[1].total.toStorage()).toBe("400");
    expect(summary.expensesByCard.map((c) => c.cardName)).toEqual(["Cash", "Visa"]);
    expect(summary.expensesByCard[1].total.toStorage()).toBe("400");
  });

  it("aggregates per month", () => {
    expect(summary.byMonth[0].income.toStorage()).toBe("2000");
    expect(summary.byMonth[0].expenses.toStorage()).toBe("300.5");
    expect(summary.byMonth[1].expenses.toStorage()).toBe("1299.5");
    expect(summary.byMonth[5].expenses.isZero()).toBe(true);
  });

  it("computes savings change from the year's first and last snapshots", () => {
    expect(summary.savingsStart?.toStorage()).toBe("10000");
    expect(summary.savingsEnd?.toStorage()).toBe("12500");
    expect(summary.savingsChange?.toStorage()).toBe("2500");
  });

  it("returns nulls for savings when the year has no snapshots", () => {
    const empty = buildAnnualSummary(2024, [], [], categories, cards);
    expect(empty.savingsStart).toBeNull();
    expect(empty.savingsChange).toBeNull();
    expect(empty.largestExpense).toBeNull();
  });
});
