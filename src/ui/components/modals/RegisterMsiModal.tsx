import { Percent, PiggyBank } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import {
  useCards,
  useCategories,
  useCreditByCard,
  useRegisterMSIPurchase,
  useUpdateMSIPlan,
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
  description: string;
  totalAmount: string;
  months: string;
  cardId: string;
  categoryId: string;
  startDate: string;
  withInterest: boolean;
  color?: ChipColor;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

const INTEREST_OPTIONS: { value: boolean; label: string; icon: LucideIcon }[] = [
  { value: false, label: "MSI · no interest", icon: PiggyBank },
  { value: true, label: "MCI · with interest", icon: Percent },
];

/** MSI (no interest) reads as the "free" option (mint); MCI costs interest (coral). */
const INTEREST_TEXT_CLASSES = ["text-mint", "text-coral"]; // [MSI, MCI]
const INTEREST_HIGHLIGHT_CLASSES = ["border-mint/30 bg-mint/15", "border-coral/30 bg-coral/15"];

export function RegisterMsiModal() {
  const addOpen = useUiStore((s) => s.activeModal === "registerMsi");
  const closeModal = useUiStore((s) => s.closeModal);
  const editTarget = useUiStore((s) => s.editTarget);
  const closeEdit = useUiStore((s) => s.closeEdit);
  const editing = editTarget?.type === "msiPlan" ? editTarget.plan : null;
  const open = addOpen || editing !== null;
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const { data: creditByCard } = useCreditByCard();
  const registerPurchase = useRegisterMSIPurchase();
  const updatePlan = useUpdateMSIPlan();

  const creditCards = cards.filter((c) => c.type === "credit");
  const expenseCategories = categories.filter((c) => c.kind === "expense");
  const availableByCard = creditByCard
    ? new Map([...creditByCard].map(([id, u]) => [id, u.available]))
    : undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { startDate: toISODate(new Date()), withInterest: false },
  });

  const color = watch("color");
  const startDate = watch("startDate");
  const cardId = watch("cardId");
  const categoryId = watch("categoryId");
  const withInterest = watch("withInterest");

  // Edit mode: prefill the same form with the plan being edited.
  useEffect(() => {
    if (editing) {
      reset({
        description: editing.description,
        totalAmount: editing.totalAmount.toStorage(),
        months: String(editing.months),
        cardId: editing.cardId,
        categoryId: editing.categoryId,
        startDate: editing.startDate,
        withInterest: editing.withInterest,
        color: editing.color,
      });
    }
  }, [editing, reset]);

  const handleClose = () => {
    closeModal();
    if (editing) {
      closeEdit();
      reset({ startDate: toISODate(new Date()), withInterest: false });
    }
  };

  const pending = editing ? updatePlan.isPending : registerPurchase.isPending;
  const mutationError = editing ? updatePlan.error : registerPurchase.error;

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updatePlan.mutate(
        { id: editing.id, ...values, months: Number(values.months) },
        { onSuccess: handleClose },
      );
    } else {
      registerPurchase.mutate(
        { ...values, months: Number(values.months) },
        {
          onSuccess: () => {
            reset({ startDate: values.startDate, withInterest: false });
            closeModal();
          },
        },
      );
    }
  });

  return (
    <Modal
      open={open}
      title={editing ? "Edit MSI / MCI plan" : "Register MSI / MCI plan"}
      onClose={handleClose}
    >
      {creditCards.length === 0 ? (
        <p className="text-sm text-white/60">
          Installment plans live on credit cards — add a credit card first.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Interest">
            <div
              className="flex rounded-full border border-white/10 bg-white/5 p-1"
              role="radiogroup"
              aria-label="Interest"
            >
              {INTEREST_OPTIONS.map((option, i) => {
                const active = withInterest === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setValue("withInterest", option.value)}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      active ? INTEREST_TEXT_CLASSES[i] : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="msiInterestHighlight"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className={`absolute inset-0 rounded-full border transition-colors ${INTEREST_HIGHLIGHT_CLASSES[i]}`}
                      />
                    )}
                    <Icon size={14} strokeWidth={2} className="relative shrink-0" />
                    <span className="relative">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>
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
            <input type="hidden" {...register("cardId", { required: "Card is required" })} />
            <CardSelect
              value={cardId}
              onChange={(v) => setValue("cardId", v, { shouldValidate: true })}
              placeholder="Select a card"
              aria-label="Credit card"
              cards={creditCards}
              availableByCard={availableByCard}
            />
          </Field>
          <Field label="Category" error={errors.categoryId?.message}>
            <input type="hidden" {...register("categoryId", { required: "Category is required" })} />
            <IconSelect
              value={categoryId}
              onChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              placeholder="Select a category"
              aria-label="Category"
              options={expenseCategories.map((c) => ({
                value: c.id,
                label: c.name,
                icon: categoryIcon(c.name),
              }))}
            />
          </Field>
          <Field label="Purchase date" error={errors.startDate?.message}>
            <input type="hidden" {...register("startDate", { required: "Purchase date is required" })} />
            <DatePicker
              value={startDate}
              onChange={(iso) => setValue("startDate", iso, { shouldValidate: true })}
              aria-label="Purchase date"
            />
          </Field>
          <Field label="Color" className="pb-3">
            <ColorSwatchPicker value={color} onChange={(c) => setValue("color", c)} />
          </Field>
          
          {editing && (
            <p className="text-xs text-white/50">
              Saving regenerates the installment schedule from the new values.
            </p>
          )}
          <Button type="submit" variant="primary" disabled={pending} className="w-full">
            {pending ? "Saving…" : editing ? "Save changes" : "Register plan"}
          </Button>
          {mutationError != null && (
            <p className="text-xs text-coral">{(mutationError as Error).message}</p>
          )}
        </form>
      )}
    </Modal>
  );
}
