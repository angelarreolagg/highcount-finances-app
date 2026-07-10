import { useForm } from "react-hook-form";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import { useCards, useCategories, useRegisterMSIPurchase } from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

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

export function RegisterMsiModal() {
  const open = useUiStore((s) => s.activeModal === "registerMsi");
  const closeModal = useUiStore((s) => s.closeModal);
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
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
      {
        onSuccess: () => {
          reset({ startDate: values.startDate, withInterest: false });
          closeModal();
        },
      },
    );
  });

  return (
    <Modal open={open} title="Register MSI / MCI plan" onClose={closeModal}>
      {creditCards.length === 0 ? (
        <p className="text-sm text-white/60">
          Installment plans live on credit cards — add a credit card first.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Description" error={errors.description?.message}>
            <input
              {...register("description", { required: "Description is required" })}
              placeholder="e.g. Laptop"
              className={control}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total (incl. interest)" error={errors.totalAmount?.message}>
              <input
                {...register("totalAmount", {
                  required: "Total is required",
                  pattern: { value: AMOUNT_PATTERN, message: "Positive amount like 123.45" },
                  validate: (v) => Number(v) > 0 || "Must be greater than zero",
                })}
                inputMode="decimal"
                placeholder="0.00"
                className={control}
              />
            </Field>
            <Field label="Months" error={errors.months?.message}>
              <input
                {...register("months", {
                  required: "Months is required",
                  validate: (v) => {
                    const n = Number(v);
                    return (Number.isInteger(n) && n >= 1 && n <= 60) || "Whole number 1–60";
                  },
                })}
                inputMode="numeric"
                placeholder="12"
                className={control}
              />
            </Field>
          </div>
          <Field label="Credit card" error={errors.cardId?.message}>
            <select {...register("cardId", { required: "Card is required" })} className={control}>
              <option value="">Select a card</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" error={errors.categoryId?.message}>
            <select {...register("categoryId", { required: "Category is required" })} className={control}>
              <option value="">Select a category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Purchase date">
            <input type="date" {...register("startDate", { required: true })} className={control} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" {...register("withInterest")} className="size-4 accent-[#818cf8]" />
            With interest (MCI)
          </label>
          <Button type="submit" variant="primary" disabled={registerPurchase.isPending} className="w-full">
            {registerPurchase.isPending ? "Registering…" : "Register plan"}
          </Button>
          {registerPurchase.isError && (
            <p className="text-xs text-coral">{(registerPurchase.error as Error).message}</p>
          )}
        </form>
      )}
    </Modal>
  );
}
