import { useForm } from "react-hook-form";
import type { TransactionType } from "../../../domain/entities/Transaction";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import { useAddTransaction, useCards, useCategories } from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

interface FormValues {
  type: TransactionType;
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function AddTransactionModal() {
  const open = useUiStore((s) => s.activeModal === "addTransaction");
  const closeModal = useUiStore((s) => s.closeModal);
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
    addTransaction.mutate(values, {
      onSuccess: () => {
        reset({ ...values, amount: "", description: "" });
        closeModal();
      },
    });
  });

  return (
    <Modal open={open} title="Add expense / income" onClose={closeModal}>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Type">
          <select {...register("type")} className={control}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </Field>
        <Field label="Amount" error={errors.amount?.message}>
          <input
            {...register("amount", {
              required: "Amount is required",
              pattern: { value: AMOUNT_PATTERN, message: "Enter a positive amount like 123.45" },
              validate: (v) => Number(v) > 0 || "Amount must be greater than zero",
            })}
            inputMode="decimal"
            placeholder="0.00"
            className={control}
          />
        </Field>
        <Field label="Category" error={errors.categoryId?.message}>
          <select {...register("categoryId", { required: "Category is required" })} className={control}>
            <option value="">Select a category</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Card / account" error={errors.cardId?.message}>
          <select {...register("cardId", { required: "Card/account is required" })} className={control}>
            <option value="">Select an account</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date" error={errors.date?.message}>
          <input type="date" {...register("date", { required: "Date is required" })} className={control} />
        </Field>
        <Field label="Description">
          <input {...register("description")} placeholder="What was it?" className={control} />
        </Field>
        <Button type="submit" variant="primary" disabled={addTransaction.isPending} className="w-full">
          {addTransaction.isPending ? "Saving…" : type === "expense" ? "Add expense" : "Add income"}
        </Button>
        {addTransaction.isError && (
          <p className="text-xs text-coral">{(addTransaction.error as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
