import { describe, expect, it } from "vitest";
import { Money } from "../value-objects/Money";
import { buildMsiSchedule } from "./msiSchedule";

describe("buildMsiSchedule", () => {
  it("splits an even total into equal monthly installments", () => {
    const { monthlyAmount, installments } = buildMsiSchedule(
      Money.from("1200"),
      12,
      "2026-01-15",
    );
    expect(monthlyAmount.toStorage()).toBe("100");
    expect(installments).toHaveLength(12);
    expect(installments.every((i) => i.amount.toStorage() === "100")).toBe(true);
  });

  it("absorbs rounding remainders in the last installment so the sum is exact", () => {
    const total = Money.from("100");
    const { installments } = buildMsiSchedule(total, 3, "2026-01-15");
    expect(installments.map((i) => i.amount.toStorage())).toEqual(["33.33", "33.33", "33.34"]);
    const sum = installments.reduce((acc, i) => acc.add(i.amount), Money.zero());
    expect(sum.equals(total)).toBe(true);
  });

  it("advances one month per installment and numbers them from 1", () => {
    const { installments } = buildMsiSchedule(Money.from("300"), 3, "2026-11-15");
    expect(installments.map((i) => i.date)).toEqual(["2026-11-15", "2026-12-15", "2027-01-15"]);
    expect(installments.map((i) => i.installmentNumber)).toEqual([1, 2, 3]);
  });

  it("clamps month-end start dates in shorter months", () => {
    const { installments } = buildMsiSchedule(Money.from("400"), 4, "2026-01-31");
    expect(installments.map((i) => i.date)).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
    ]);
  });

  it("rejects invalid inputs", () => {
    expect(() => buildMsiSchedule(Money.from("100"), 0, "2026-01-01")).toThrow();
    expect(() => buildMsiSchedule(Money.from("100"), 2.5, "2026-01-01")).toThrow();
    expect(() => buildMsiSchedule(Money.zero(), 3, "2026-01-01")).toThrow();
    expect(() => buildMsiSchedule(Money.from("-5"), 3, "2026-01-01")).toThrow();
  });
});
