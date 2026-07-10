import { describe, expect, it } from "vitest";
import type { SavingsEntry } from "../entities/SavingsEntry";
import { Money } from "../value-objects/Money";
import { buildSavingsSummary } from "./savingsSummary";

const entry = (
  date: string,
  amount: string,
  kind: "deposit" | "returns",
): SavingsEntry => ({ id: `${date}-${amount}`, date, amount: Money.from(amount), kind });

describe("buildSavingsSummary", () => {
  it("splits deposits from returns and sums the balance", () => {
    const summary = buildSavingsSummary([
      entry("2026-01-10", "10000", "deposit"),
      entry("2026-02-10", "350.50", "returns"),
      entry("2026-03-10", "5000", "deposit"),
      entry("2026-04-10", "149.50", "returns"),
    ]);
    expect(summary.totalDeposits.toStorage()).toBe("15000");
    expect(summary.totalReturns.toStorage()).toBe("500");
    expect(summary.currentBalance.toStorage()).toBe("15500");
  });

  it("builds a date-ordered timeline with running balances", () => {
    const summary = buildSavingsSummary([
      entry("2026-03-10", "500", "returns"),
      entry("2026-01-10", "1000", "deposit"), // out of order on purpose
    ]);
    expect(summary.timeline.map((p) => p.date)).toEqual(["2026-01-10", "2026-03-10"]);
    expect(summary.timeline.map((p) => p.balanceAfter.toStorage())).toEqual(["1000", "1500"]);
  });

  it("handles no entries", () => {
    const summary = buildSavingsSummary([]);
    expect(summary.currentBalance.isZero()).toBe(true);
    expect(summary.timeline).toHaveLength(0);
  });
});
