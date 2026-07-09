import { useForm } from "react-hook-form";
import type { TransactionType } from "../../../domain/entities/Transaction";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useAddTransaction, useCards, useCategories } from "../../hooks/useDashboardData";

interface FormValues {
  type: TransactionType;
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function QuickAddForm() {
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const addTransaction = useAddTransaction();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { type: "expense", amount: "", date: toISODate(new Date()), description: "" },
  });

  const type = watch("type");
  const typeCategories = categories.filter((c) => c.kind === type);

  const onSubmit = handleSubmit((values) => {
    addTransaction.mutate(values, { onSuccess: () => reset({ ...values, amount: "", description: "" }) });
  });

  return (
    <section className="mb-6 border p-3">
      <h2 className="text-lg font-semibold mb-2">Add expense / income</h2>
      <form onSubmit={onSubmit} className="space-y-2 text-sm">
        <div>
          <label className="mr-2">Type</label>
          <select {...register("type")} className="border p-1">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Amount</label>
          <input
            {...register("amount", {
              required: "Amount is required",
              pattern: { value: AMOUNT_PATTERN, message: "Enter a positive amount like 123.45" },
              validate: (v) => Number(v) > 0 || "Amount must be greater than zero",
            })}
            inputMode="decimal"
            className="border p-1"
          />
          {errors.amount && <span className="text-red-600 ml-2">{errors.amount.message}</span>}
        </div>
        <div>
          <label className="mr-2">Category</label>
          <select {...register("categoryId", { required: "Category is required" })} className="border p-1">
            <option value="">— select —</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="text-red-600 ml-2">{errors.categoryId.message}</span>}
        </div>
        <div>
          <label className="mr-2">Card / account</label>
          <select {...register("cardId", { required: "Card/account is required" })} className="border p-1">
            <option value="">— select —</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
          {errors.cardId && <span className="text-red-600 ml-2">{errors.cardId.message}</span>}
        </div>
        <div>
          <label className="mr-2">Date</label>
          <input type="date" {...register("date", { required: "Date is required" })} className="border p-1" />
          {errors.date && <span className="text-red-600 ml-2">{errors.date.message}</span>}
        </div>
        <div>
          <label className="mr-2">Description</label>
          <input {...register("description")} className="border p-1 w-64" />
        </div>
        <button type="submit" disabled={addTransaction.isPending} className="border px-3 py-1">
          {addTransaction.isPending ? "Saving…" : "Add"}
        </button>
        {addTransaction.isError && (
          <span className="text-red-600 ml-2">{(addTransaction.error as Error).message}</span>
        )}
      </form>
    </section>
  );
}
