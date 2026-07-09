import { useForm } from "react-hook-form";
import { toISODate } from "../../../domain/value-objects/calendar";
import {
  useCards,
  useCategories,
  useMsiPlans,
  useRegisterMSIPurchase,
} from "../../hooks/useDashboardData";

interface FormValues {
  description: string;
  totalAmount: string;
  months: string;
  cardId: string;
  categoryId: string;
  startDate: string;
  withInterest: boolean;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function MSISection() {
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const { data: plans = [] } = useMsiPlans();
  const registerPurchase = useRegisterMSIPurchase();

  const creditCards = cards.filter((c) => c.type === "credit");
  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { startDate: toISODate(new Date()), withInterest: false },
  });

  const onSubmit = handleSubmit((values) => {
    registerPurchase.mutate(
      { ...values, months: Number(values.months) },
      { onSuccess: () => reset({ startDate: values.startDate, withInterest: false }) },
    );
  });

  return (
    <section className="mb-6 border p-3">
      <h2 className="text-lg font-semibold mb-2">MSI / MCI plans</h2>
      <ul className="text-sm mb-3 list-disc pl-5">
        {plans.length === 0 && <li className="list-none">No installment plans yet.</li>}
        {plans.map((p) => (
          <li key={p.id}>
            {p.description} — {p.totalAmount.format()} over {p.months} months (
            {p.monthlyAmount.format()}/month, {p.withInterest ? "with interest" : "interest-free"}),
            started {p.startDate}
          </li>
        ))}
      </ul>
      {creditCards.length === 0 ? (
        <p className="text-sm">Add a credit card first to register an installment purchase.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-2 text-sm">
          <div>
            <label className="mr-2">Description</label>
            <input
              {...register("description", { required: "Description is required" })}
              className="border p-1 w-64"
            />
            {errors.description && (
              <span className="text-red-600 ml-2">{errors.description.message}</span>
            )}
          </div>
          <div>
            <label className="mr-2">Total amount (incl. interest if any)</label>
            <input
              {...register("totalAmount", {
                required: "Total is required",
                pattern: { value: AMOUNT_PATTERN, message: "Enter a positive amount like 123.45" },
                validate: (v) => Number(v) > 0 || "Total must be greater than zero",
              })}
              inputMode="decimal"
              className="border p-1"
            />
            {errors.totalAmount && (
              <span className="text-red-600 ml-2">{errors.totalAmount.message}</span>
            )}
          </div>
          <div>
            <label className="mr-2">Months</label>
            <input
              {...register("months", {
                required: "Months is required",
                validate: (v) => {
                  const n = Number(v);
                  return (Number.isInteger(n) && n >= 1 && n <= 60) || "Enter a whole number 1–60";
                },
              })}
              inputMode="numeric"
              className="border p-1 w-16"
            />
            {errors.months && <span className="text-red-600 ml-2">{errors.months.message}</span>}
          </div>
          <div>
            <label className="mr-2">Credit card</label>
            <select {...register("cardId", { required: "Card is required" })} className="border p-1">
              <option value="">— select —</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.cardId && <span className="text-red-600 ml-2">{errors.cardId.message}</span>}
          </div>
          <div>
            <label className="mr-2">Category</label>
            <select
              {...register("categoryId", { required: "Category is required" })}
              className="border p-1"
            >
              <option value="">— select —</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-red-600 ml-2">{errors.categoryId.message}</span>
            )}
          </div>
          <div>
            <label className="mr-2">Purchase date</label>
            <input type="date" {...register("startDate", { required: true })} className="border p-1" />
          </div>
          <div>
            <label className="mr-2">
              <input type="checkbox" {...register("withInterest")} className="mr-1" />
              With interest (MCI)
            </label>
          </div>
          <button type="submit" disabled={registerPurchase.isPending} className="border px-3 py-1">
            {registerPurchase.isPending ? "Registering…" : "Register plan"}
          </button>
          {registerPurchase.isError && (
            <span className="text-red-600 ml-2">{(registerPurchase.error as Error).message}</span>
          )}
        </form>
      )}
    </section>
  );
}
