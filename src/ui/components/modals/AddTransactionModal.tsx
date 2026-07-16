import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { TransactionType } from "../../../domain/entities/Transaction";
import { Money } from "../../../domain/value-objects/Money";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import {
  useAddTransaction,
  useCards,
  useCategories,
  useCreditByCard,
  useUpdateTransaction,
} from "../../hooks/useDashboardData";
import { categoryIcon } from "../../utils/categoryIcons";
import { Button } from "../shared/Button";
import { CardSelect } from "../shared/CardSelect";
import { ColorSwatchPicker } from "../shared/ColorSwatchPicker";
import { DatePicker } from "../shared/DatePicker";
import { Field } from "../shared/Field";
import { IconSelect } from "../shared/IconSelect";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

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
const QUICK_AMOUNTS = [10, 100, 200, 500, 1000];

const TYPE_OPTIONS: { value: TransactionType; label: string; icon: LucideIcon }[] = [
  { value: "expense", label: "Expense", icon: ArrowDown },
  { value: "income", label: "Income", icon: ArrowUp },
];

/** Discreet, per-option selected-state tint — reuses the app's existing coral/mint tokens. */
const TYPE_TEXT_CLASSES: Record<TransactionType, string> = {
  expense: "text-coral",
  income: "text-mint",
};
const TYPE_HIGHLIGHT_CLASSES: Record<TransactionType, string> = {
  expense: "border-coral/30 bg-coral/15",
  income: "border-mint/30 bg-mint/15",
};

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
  const { data: creditByCard } = useCreditByCard();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  const availableByCard = creditByCard
    ? new Map([...creditByCard].map(([id, u]) => [id, u.available]))
    : undefined;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  const type = watch("type");
  const categoryId = watch("categoryId");
  const cardId = watch("cardId");
  const date = watch("date");
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

  const bumpAmount = (n: number) => {
    const current = Money.from(getValues("amount") || "0");
    setValue("amount", current.add(Money.from(n)).round2().toStorage(), { shouldValidate: true });
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
          <div
            className="flex rounded-full border border-white/10 bg-white/5 p-1"
            role="radiogroup"
            aria-label="Type"
          >
            {TYPE_OPTIONS.map((option) => {
              const active = type === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue("type", option.value, { shouldValidate: true })}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? TYPE_TEXT_CLASSES[option.value] : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="transactionTypeHighlight"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      className={`absolute inset-0 rounded-full border transition-colors ${TYPE_HIGHLIGHT_CLASSES[option.value]}`}
                    />
                  )}
                  <Icon size={14} strokeWidth={2} className="relative shrink-0" />
                  <span className="relative">{option.label}</span>
                </button>
              );
            })}
          </div>
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => bumpAmount(n)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                +{n}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Category" error={errors.categoryId?.message}>
          <input type="hidden" {...register("categoryId", { required: "Category is required" })} />
          <IconSelect
            value={categoryId}
            onChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
            placeholder="Select a category"
            aria-label="Category"
            options={typeCategories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: categoryIcon(c.name),
            }))}
          />
        </Field>

        <Field label="Card / account" error={errors.cardId?.message}>
          <input type="hidden" {...register("cardId", { required: "Card/account is required" })} />
          <CardSelect
            value={cardId}
            onChange={(v) => setValue("cardId", v, { shouldValidate: true })}
            placeholder="Select an account"
            aria-label="Card / account"
            cards={cards}
            availableByCard={availableByCard}
          />
        </Field>

        <Field label="Date" error={errors.date?.message}>
          <input type="hidden" {...register("date", { required: "Date is required" })} />
          <DatePicker
            value={date}
            onChange={(iso) => setValue("date", iso, { shouldValidate: true })}
            aria-label="Date"
          />
        </Field>
        <Field label="Description">
          <input {...register("description")} placeholder="What was it?" className={control} />
        </Field>
        <Field label="Color" className="pb-3">
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
