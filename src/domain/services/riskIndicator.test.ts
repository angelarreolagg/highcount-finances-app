import { describe, expect, it } from "vitest";
import type { Transaction } from "../entities/Transaction";
import { Money } from "../value-objects/Money";
import { assessRunway, averageMonthlyIncome } from "./riskIndicator";

const income = (date: string, amount: string): Transaction => ({
  id: date + amount,
  type: "income",
  amount: Money.from(amount),
  categoryId: "cat-salary",
  cardId: "cash",
  date,
  description: "salary",
});

const expense = (date: string, amount: string): Transaction => ({
  id: "e" + date + amount,
  type: "expense",
  amount: Money.from(amount),
  categoryId: "cat-food",
  cardId: "cash",
  date,
  description: "food",
});

describe("averageMonthlyIncome", () => {
  it("averages income across distinct months only", () => {
    const avg = averageMonthlyIncome([
      income("2026-01-15", "1000"),
      income("2026-01-30", "500"), // same month
      income("2026-02-15", "1500"),
      expense("2026-02-16", "9999"), // ignored
    ]);
    expect(avg?.toStorage()).toBe("1500"); // 3000 over 2 months
  });

  it("returns null with no income data", () => {
    expect(averageMonthlyIncome([expense("2026-01-01", "10")])).toBeNull();
  });
});

describe("assessRunway", () => {
  it("warns below the warning threshold (4 months)", () => {
    const result = assessRunway(Money.from("3999"), Money.from("1000"));
    expect(result.level).toBe("warning");
    expect(result.monthsOfRunway?.toString()).toBe("3.999");
  });

  it("is ok at exactly 4 months or more", () => {
    expect(assessRunway(Money.from("4000"), Money.from("1000")).level).toBe("ok");
    expect(assessRunway(Money.from("10000"), Money.from("1000")).level).toBe("ok");
  });

  it("is unknown without a balance or salary", () => {
    expect(assessRunway(null, Money.from("1000")).level).toBe("unknown");
    expect(assessRunway(Money.from("5000"), null).level).toBe("unknown");
    expect(assessRunway(Money.from("5000"), Money.zero()).level).toBe("unknown");
  });
});
