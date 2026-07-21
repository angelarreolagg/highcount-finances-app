import { describe, expect, it } from "vitest";
import type {
  CardRecord,
  MSIPlanRecord,
  SavingsRecord,
  TransactionRecord,
} from "./records";
import {
  cardFromRecord,
  cardToRecord,
  msiPlanFromRecord,
  msiPlanToRecord,
  savingsFromRecord,
  savingsToRecord,
  transactionFromRecord,
  transactionToRecord,
} from "./records";

/**
 * Record → entity → record must be identity (lossless). This is the guarantee that a
 * local export and a cloud row hold byte-identical data, incl. exact Money strings.
 */
describe("canonical record round-trips", () => {
  it("transaction (incl. MSI installment fields + color)", () => {
    const record: TransactionRecord = {
      id: "t1",
      type: "expense",
      amount: "1333.33",
      categoryId: "cat-shopping",
      cardId: "card-1",
      date: "2026-07-19",
      description: "iPhone 16 Pro Max",
      msiPlanId: "plan-1",
      installmentNumber: 8,
      installmentCount: 12,
      color: "sky",
    };
    expect(transactionToRecord(transactionFromRecord(record))).toEqual(record);
  });

  it("card with a credit limit", () => {
    const record: CardRecord = {
      id: "card-1",
      name: "BBVA",
      type: "credit",
      cutDay: 28,
      paymentDueDay: 17,
      color: "#818cf8",
      last4: "1234",
      creditLimit: "50000",
    };
    expect(cardToRecord(cardFromRecord(record))).toEqual(record);
  });

  it("savings movement", () => {
    const record: SavingsRecord = {
      id: "s1",
      date: "2026-07-09",
      amount: "10600",
      kind: "returns",
      note: "CETES",
      color: "emerald",
      cardId: "card-1",
    };
    expect(savingsToRecord(savingsFromRecord(record))).toEqual(record);
  });

  it("legacy savings balance snapshot reads as a deposit", () => {
    const legacy: SavingsRecord = { id: "s2", date: "2026-01-01", balance: "500" };
    const entity = savingsFromRecord(legacy);
    expect(entity.kind).toBe("deposit");
    expect(entity.amount.toStorage()).toBe("500");
  });

  it("MSI plan (incl. color)", () => {
    const record: MSIPlanRecord = {
      id: "plan-1",
      cardId: "card-1",
      categoryId: "cat-shopping",
      description: "iPhone",
      totalAmount: "16000",
      months: 12,
      monthlyAmount: "1333.33",
      withInterest: false,
      startDate: "2026-07-10",
      color: "violet",
    };
    expect(msiPlanToRecord(msiPlanFromRecord(record))).toEqual(record);
  });
});
