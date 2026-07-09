import Decimal from "decimal.js";

/**
 * Every monetary value in the app flows through this wrapper.
 * Raw floats must never be used for currency math.
 */
export class Money {
  private readonly value: Decimal;

  private constructor(value: Decimal) {
    this.value = value;
  }

  static from(input: string | number | Decimal): Money {
    const d = new Decimal(input);
    if (!d.isFinite()) {
      throw new Error(`Invalid monetary value: ${String(input)}`);
    }
    return new Money(d);
  }

  static zero(): Money {
    return new Money(new Decimal(0));
  }

  add(other: Money): Money {
    return new Money(this.value.plus(other.value));
  }

  subtract(other: Money): Money {
    return new Money(this.value.minus(other.value));
  }

  times(factor: number | string): Money {
    return new Money(this.value.times(factor));
  }

  dividedBy(divisor: number | string): Money {
    if (new Decimal(divisor).isZero()) {
      throw new Error("Cannot divide Money by zero");
    }
    return new Money(this.value.dividedBy(divisor));
  }

  /** Round to 2 decimal places (cents). */
  round2(): Money {
    return new Money(this.value.toDecimalPlaces(2));
  }

  /** this ÷ other as a plain Decimal ratio, or null when other is zero. */
  ratio(other: Money): Decimal | null {
    if (other.value.isZero()) return null;
    return this.value.dividedBy(other.value);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  isPositive(): boolean {
    return this.value.greaterThan(0);
  }

  isNegative(): boolean {
    return this.value.lessThan(0);
  }

  equals(other: Money): boolean {
    return this.value.equals(other.value);
  }

  greaterThan(other: Money): boolean {
    return this.value.greaterThan(other.value);
  }

  lessThan(other: Money): boolean {
    return this.value.lessThan(other.value);
  }

  /** Exact string representation for persistence. */
  toStorage(): string {
    return this.value.toString();
  }

  /** For display/sorting only — never feed back into money math. */
  toNumber(): number {
    return this.value.toNumber();
  }

  format(currency = "MXN", locale = "es-MX"): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      this.value.toNumber(),
    );
  }
}
