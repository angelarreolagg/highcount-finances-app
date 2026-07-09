import { useForm } from "react-hook-form";
import type { CardType } from "../../../domain/entities/Card";
import { useAddCard, useCards } from "../../hooks/useDashboardData";

interface FormValues {
  name: string;
  type: CardType;
  cutDay: string;
  paymentDueDay: string;
}

export function CardsSection() {
  const { data: cards = [] } = useCards();
  const addCard = useAddCard();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { type: "credit", cutDay: "", paymentDueDay: "" } });

  const type = watch("type");
  const dayRules = {
    required: "Required for credit cards",
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= 31) || "Day must be 1–31";
    },
  };

  const onSubmit = handleSubmit((values) => {
    addCard.mutate(
      {
        name: values.name,
        type: values.type,
        cutDay: values.type === "credit" ? Number(values.cutDay) : undefined,
        paymentDueDay: values.type === "credit" ? Number(values.paymentDueDay) : undefined,
      },
      { onSuccess: () => reset() },
    );
  });

  return (
    <section className="mb-6 border p-3">
      <h2 className="text-lg font-semibold mb-2">Cards & accounts</h2>
      <ul className="text-sm mb-3 list-disc pl-5">
        {cards.map((c) => (
          <li key={c.id}>
            {c.name} ({c.type})
            {c.type === "credit" && ` — cuts day ${c.cutDay}, payment due day ${c.paymentDueDay}`}
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="space-y-2 text-sm">
        <div>
          <label className="mr-2">Name</label>
          <input {...register("name", { required: "Name is required" })} className="border p-1" />
          {errors.name && <span className="text-red-600 ml-2">{errors.name.message}</span>}
        </div>
        <div>
          <label className="mr-2">Type</label>
          <select {...register("type")} className="border p-1">
            <option value="credit">Credit card</option>
            <option value="debit">Debit card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        {type === "credit" && (
          <>
            <div>
              <label className="mr-2">Cut day (statement closes)</label>
              <input {...register("cutDay", dayRules)} inputMode="numeric" className="border p-1 w-16" />
              {errors.cutDay && <span className="text-red-600 ml-2">{errors.cutDay.message}</span>}
            </div>
            <div>
              <label className="mr-2">Payment due day</label>
              <input {...register("paymentDueDay", dayRules)} inputMode="numeric" className="border p-1 w-16" />
              {errors.paymentDueDay && (
                <span className="text-red-600 ml-2">{errors.paymentDueDay.message}</span>
              )}
            </div>
          </>
        )}
        <button type="submit" disabled={addCard.isPending} className="border px-3 py-1">
          Add card
        </button>
        {addCard.isError && <span className="text-red-600 ml-2">{(addCard.error as Error).message}</span>}
      </form>
    </section>
  );
}
