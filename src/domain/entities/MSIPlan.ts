import type { Money } from "../value-objects/Money";

/**
 * A fixed-installment purchase plan (MSI = meses sin intereses,
 * MCI = meses con intereses). totalAmount is the full amount the user
 * will end up paying (interest included when withInterest is true).
 */
export interface MSIPlan {
  id: string;
  cardId: string;
  categoryId: string;
  description: string;
  totalAmount: Money;
  months: number;
  monthlyAmount: Money;
  withInterest: boolean;
  /** Local ISO date of the purchase / first installment. */
  startDate: string;
}
