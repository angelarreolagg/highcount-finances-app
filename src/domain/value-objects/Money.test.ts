import { describe, expect, it } from "vitest";
import { Money } from "./Money";

describe("Money", () => {
  it("adds without float errors", () => {
    const result = Money.from("0.1").add(Money.from("0.2"));
    expect(result.toStorage()).toBe("0.3");
  });

  it("round-trips exactly through storage strings", () => {
    const original = Money.from("12345.67");
    expect(Money.from(original.toStorage()).equals(original)).toBe(true);
  });

  it("rejects non-finite values", () => {
    expect(() => Money.from(Number.NaN)).toThrow();
    expect(() => Money.from(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => Money.from("not-a-number")).toThrow();
  });

  it("rejects division by zero", () => {
    expect(() => Money.from("10").dividedBy(0)).toThrow();
  });

  it("compares correctly", () => {
    expect(Money.from("10.50").greaterThan(Money.from("10.49"))).toBe(true);
    expect(Money.from("-1").isNegative()).toBe(true);
    expect(Money.zero().isZero()).toBe(true);
  });

  it("ratio returns null on zero denominator", () => {
    expect(Money.from("10").ratio(Money.zero())).toBeNull();
    expect(Money.from("10").ratio(Money.from("4"))?.toString()).toBe("2.5");
  });

  it("rounds to cents", () => {
    expect(Money.from("10").dividedBy(3).round2().toStorage()).toBe("3.33");
  });
});
