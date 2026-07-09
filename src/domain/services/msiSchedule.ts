import { Money } from "../value-objects/Money";
import {
  addMonths,
  clampDay,
  monthPrefix,
  parseISODate,
} from "../value-objects/calendar";

export interface InstallmentDraft {
  installmentNumber: number;
  /** Local ISO date, "YYYY-MM-DD". */
  date: string;
  amount: Money;
}

export interface MsiSchedule {
  monthlyAmount: Money;
  installments: InstallmentDraft[];
}

/**
 * Split a fixed-installment purchase into one charge per month starting at
 * startDate. Each installment is the total ÷ months rounded to cents; the
 * LAST installment absorbs the rounding remainder so the sum is exact.
 * Day-of-month is clamped for shorter months (a purchase on the 31st lands
 * on Feb 28/29 in February).
 */
export function buildMsiSchedule(
  totalAmount: Money,
  months: number,
  startDateISO: string,
): MsiSchedule {
  if (!Number.isInteger(months) || months < 1) {
    throw new Error(`MSI plan requires a whole number of months >= 1, got ${months}`);
  }
  if (!totalAmount.isPositive()) {
    throw new Error("MSI plan total amount must be positive");
  }

  const monthly = totalAmount.dividedBy(months).round2();
  const start = parseISODate(startDateISO);
  const installments: InstallmentDraft[] = [];
  let scheduled = Money.zero();

  for (let i = 0; i < months; i++) {
    const ym = addMonths(start.year, start.monthIndex, i);
    const day = clampDay(ym.year, ym.monthIndex, start.day);
    const isLast = i === months - 1;
    const amount = isLast ? totalAmount.subtract(scheduled) : monthly;
    scheduled = scheduled.add(amount);
    installments.push({
      installmentNumber: i + 1,
      date: `${monthPrefix(ym.year, ym.monthIndex)}-${String(day).padStart(2, "0")}`,
      amount,
    });
  }

  return { monthlyAmount: monthly, installments };
}
