import { describe, expect, it } from "vitest";
import type { Card } from "../entities/Card";
import {
  getYearAvailability,
  isMonthEnabled,
  isPreviousMonthOpen,
  statementPaymentDueDate,
} from "./billingCycle";

const creditCard = (cutDay: number, paymentDueDay: number): Card => ({
  id: "c1",
  name: "Test credit",
  type: "credit",
  cutDay,
  paymentDueDay,
});

const cashAccount: Card = { id: "cash", name: "Cash", type: "cash" };

describe("statementPaymentDueDate", () => {
  it("lands in the same month when due day is after cut day", () => {
    // cuts on the 10th, due on the 30th of the same month
    const due = statementPaymentDueDate(creditCard(10, 30), 2026, 0);
    expect(due).toEqual(new Date(2026, 0, 30));
  });

  it("rolls to the next month when due day is on or before cut day", () => {
    // cuts on the 28th, due on the 17th of the following month
    const due = statementPaymentDueDate(creditCard(28, 17), 2026, 0);
    expect(due).toEqual(new Date(2026, 1, 17));
  });

  it("clamps the due day for short months", () => {
    // cuts on the 31st of January, due day 30 rolls to February → clamped to Feb 28
    const due = statementPaymentDueDate(creditCard(31, 30), 2026, 0);
    expect(due).toEqual(new Date(2026, 1, 28));
  });

  it("returns null for non-credit accounts", () => {
    expect(statementPaymentDueDate(cashAccount, 2026, 0)).toBeNull();
  });
});

describe("isPreviousMonthOpen", () => {
  // Card cuts on the 28th, payment due the 17th of the following month.
  // June's statement (cut Jun 28) is due Jul 17.
  const card = creditCard(28, 17);

  it("is open while the previous month's due date hasn't passed", () => {
    expect(isPreviousMonthOpen([card], new Date(2026, 6, 9))).toBe(true);
  });

  it("is open on the due date itself", () => {
    expect(isPreviousMonthOpen([card], new Date(2026, 6, 17))).toBe(true);
  });

  it("closes the day after the due date", () => {
    expect(isPreviousMonthOpen([card], new Date(2026, 6, 18))).toBe(false);
  });

  it("is closed when the user has no credit cards", () => {
    expect(isPreviousMonthOpen([cashAccount], new Date(2026, 6, 1))).toBe(false);
  });

  it("uses the latest due date across multiple cards", () => {
    const early = creditCard(5, 25); // June statement due Jun 25 — already passed
    const late = creditCard(28, 17); // June statement due Jul 17 — still open
    expect(isPreviousMonthOpen([early, late], new Date(2026, 6, 10))).toBe(true);
  });
});

describe("isMonthEnabled / getYearAvailability", () => {
  const card = creditCard(28, 17);
  const today = new Date(2026, 6, 9); // July 9, 2026 — June statement due Jul 17

  it("enables the current month", () => {
    expect(isMonthEnabled(2026, 6, [card], today)).toBe(true);
  });

  it("enables the previous month while its cycle is open", () => {
    expect(isMonthEnabled(2026, 5, [card], today)).toBe(true);
    expect(isMonthEnabled(2026, 5, [card], new Date(2026, 6, 20))).toBe(false);
  });

  it("disables future and older months", () => {
    expect(isMonthEnabled(2026, 7, [card], today)).toBe(false);
    expect(isMonthEnabled(2026, 4, [card], today)).toBe(false);
    expect(isMonthEnabled(2027, 0, [card], today)).toBe(false);
  });

  it("handles the January → previous December boundary across years", () => {
    const january = new Date(2027, 0, 10); // December statement (cut Dec 28) due Jan 17
    expect(isMonthEnabled(2026, 11, [card], january)).toBe(true);
    expect(isMonthEnabled(2026, 11, [card], new Date(2027, 0, 18))).toBe(false);
  });

  it("builds a 12-slot availability array", () => {
    const availability = getYearAvailability(2026, [card], today);
    expect(availability).toHaveLength(12);
    expect(availability[6]).toBe(true); // July (current)
    expect(availability[5]).toBe(true); // June (still open)
    expect(availability[7]).toBe(false); // August
  });
});
