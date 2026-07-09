import { useForm } from "react-hook-form";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useLogSavingsGrowth, useSavingsEntries } from "../../hooks/useDashboardData";

interface FormValues {
  date: string;
  balance: string;
  note: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function SavingsSection() {
  const { data: entries = [] } = useSavingsEntries();
  const logSavings = useLogSavingsGrowth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { date: toISODate(new Date()), note: "" } });

  const onSubmit = handleSubmit((values) => {
    logSavings.mutate(values, { onSuccess: () => reset({ date: values.date, balance: "", note: "" }) });
  });

  return (
    <section className="mb-6 border p-3">
      <h2 className="text-lg font-semibold mb-2">Savings (manual log)</h2>
      <ul className="text-sm mb-3 list-disc pl-5">
        {entries.length === 0 && <li className="list-none">No savings snapshots yet.</li>}
        {entries.map((e) => (
          <li key={e.id}>
            {e.date}: {e.balance.format()}
            {e.note ? ` — ${e.note}` : ""}
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="space-y-2 text-sm">
        <div>
          <label className="mr-2">Date</label>
          <input type="date" {...register("date", { required: "Date is required" })} className="border p-1" />
        </div>
        <div>
          <label className="mr-2">Total balance</label>
          <input
            {...register("balance", {
              required: "Balance is required",
              pattern: { value: AMOUNT_PATTERN, message: "Enter a non-negative amount like 123.45" },
            })}
            inputMode="decimal"
            className="border p-1"
          />
          {errors.balance && <span className="text-red-600 ml-2">{errors.balance.message}</span>}
        </div>
        <div>
          <label className="mr-2">Note</label>
          <input {...register("note")} className="border p-1 w-64" />
        </div>
        <button type="submit" disabled={logSavings.isPending} className="border px-3 py-1">
          Log balance
        </button>
        {logSavings.isError && (
          <span className="text-red-600 ml-2">{(logSavings.error as Error).message}</span>
        )}
      </form>
    </section>
  );
}
