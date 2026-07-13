import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { TransactionType } from "../../../domain/entities/Transaction";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import {
  useAddTransaction,
  useCards,
  useCategories,
  useUpdateTransaction,
} from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { ColorSwatchPicker } from "../shared/ColorSwatchPicker";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";
import { Select } from "../shared/Select";

interface FormValues {
  type: TransactionType;
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
  color?: ChipColor;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

const DEFAULT_VALUES = {
  type: "expense" as TransactionType,
  amount: "",
  date: toISODate(new Date()),
  description: "",
  color: undefined,
};

export function AddTransactionModal() {
  const addOpen = useUiStore((s) => s.activeModal === "addTransaction");
  const closeModal = useUiStore((s) => s.closeModal);
  const editTarget = useUiStore((s) => s.editTarget);
  const closeEdit = useUiStore((s) => s.closeEdit);
  const editing = editTarget?.type === "transaction" ? editTarget.transaction : null;
  const open = addOpen || editing !== null;
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  const type = watch("type");
  const color = watch("color");
  const typeCategories = categories.filter((c) => c.kind === type);

  // Edit mode: prefill the same form with the transaction being edited.
  useEffect(() => {
    if (editing) {
      reset({
        type: editing.type,
        amount: editing.amount.toStorage(),
        categoryId: editing.categoryId,
        cardId: editing.cardId,
        date: editing.date,
        description: editing.description,
        color: editing.color,
      });
    }
  }, [editing, reset]);

  const handleClose = () => {
    closeModal();
    if (editing) {
      closeEdit();
      reset(DEFAULT_VALUES);
    }
  };

  const pending = editing ? updateTransaction.isPending : addTransaction.isPending;
  const mutationError = editing ? updateTransaction.error : addTransaction.error;

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updateTransaction.mutate({ id: editing.id, ...values }, { onSuccess: handleClose });
    } else {
      addTransaction.mutate(values, {
        onSuccess: () => {
          // Keep category/card/date sticky for rapid logging, but color is per-entry.
          reset({ ...values, amount: "", description: "", color: undefined });
          closeModal();
        },
      });
    }
  });

  return (
    <Modal
      open={open}
      title={editing ? "Edit expense / income" : "Add expense / income"}
      onClose={handleClose}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Type">
          <Select {...register("type")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
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
          <Select {...register("categoryId", { required: "Category is required" })}>
            <option value="">Select a category</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Card / account" error={errors.cardId?.message}>
          <Select {...register("cardId", { required: "Card/account is required" })}>
            <option value="">Select an account</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" error={errors.date?.message}>
          <input type="date" {...register("date", { required: "Date is required" })} className={control} />
        </Field>
        <Field label="Description">
          <input {...register("description")} placeholder="What was it?" className={control} />
        </Field>
        <Field label="Color">
          <ColorSwatchPicker value={color} onChange={(c) => setValue("color", c)} />
        </Field>
        <Button type="submit" variant="primary" disabled={pending} className="w-full">
          {pending
            ? "Saving…"
            : editing
              ? "Save changes"
              : type === "expense"
                ? "Add expense"
                : "Add income"}
        </Button>
        {mutationError != null && (
          <p className="text-xs text-coral">{(mutationError as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
