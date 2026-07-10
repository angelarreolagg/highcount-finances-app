import { describe, expect, it } from "vitest";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { summarizeYearByMonth } from "./monthlySummary";

const tx = (type: "income" | "expense", date: string, amount: string): Transaction => ({
  id: `${type}-${date}-${amount}`,
  type,
  amount: Money.from(amount),
  categoryId: "cat",
  cardId: "card",
  date,
  description: "test",
});

describe("summarizeYearByMonth", () => {
  it("buckets transactions into their month slots", () => {
    const byMonth = summarizeYearByMonth([
      tx("income", "2026-01-15", "1000"),
      tx("expense", "2026-01-20", "300.25"),
      tx("expense", "2026-01-28", "99.75"),
      tx("expense", "2026-12-01", "50"),
    ]);
    expect(byMonth).toHaveLength(12);
    expect(byMonth[0].income.toStorage()).toBe("1000");
    expect(byMonth[0].expenses.toStorage()).toBe("400");
    expect(byMonth[11].expenses.toStorage()).toBe("50");
  });

  it("leaves inactive months at zero", () => {
    const byMonth = summarizeYearByMonth([tx("expense", "2026-06-10", "10")]);
    expect(byMonth[4].income.isZero()).toBe(true);
    expect(byMonth[4].expenses.isZero()).toBe(true);
    expect(byMonth[5].expenses.toStorage()).toBe("10");
  });
});
