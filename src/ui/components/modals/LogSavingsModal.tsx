import { ArrowDownToLine, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { SavingsEntryKind } from "../../../domain/entities/SavingsEntry";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import { useCards, useLogSavingsGrowth, useUpdateSavingsEntry } from "../../hooks/useDashboardData";
import { savingsKindLabel } from "../../i18n/labels";
import { Button } from "../shared/Button";
import { CardSelect } from "../shared/CardSelect";
import { ColorSwatchPicker } from "../shared/ColorSwatchPicker";
import { DatePicker } from "../shared/DatePicker";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

interface FormValues {
  date: string;
  amount: string;
  kind: SavingsEntryKind;
  note: string;
  color?: ChipColor;
  cardId: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

const KIND_OPTIONS: { value: SavingsEntryKind; icon: LucideIcon }[] = [
  { value: "deposit", icon: ArrowDownToLine },
  { value: "returns", icon: TrendingUp },
];

/** Deposit is neutral (money put in); returns render in mint (interest produced). */
const KIND_TEXT_CLASSES: Record<SavingsEntryKind, string> = {
  deposit: "text-white",
  returns: "text-mint",
};
const KIND_HIGHLIGHT_CLASSES: Record<SavingsEntryKind, string> = {
  deposit: "border-white/20 bg-white/10",
  returns: "border-mint/30 bg-mint/15",
};

const DEFAULT_VALUES = {
  date: toISODate(new Date()),
  kind: "deposit" as SavingsEntryKind,
  amount: "",
  note: "",
  cardId: "",
};

export function LogSavingsModal() {
  const { t } = useTranslation();
  const addOpen = useUiStore((s) => s.activeModal === "logSavings");
  const closeModal = useUiStore((s) => s.closeModal);
  const editTarget = useUiStore((s) => s.editTarget);
  const closeEdit = useUiStore((s) => s.closeEdit);
  const editing = editTarget?.type === "savings" ? editTarget.entry : null;
  const open = addOpen || editing !== null;
  const { data: cards = [] } = useCards();
  const logSavings = useLogSavingsGrowth();
  const updateEntry = useUpdateSavingsEntry();

  // Savings live in debit/cash accounts, not on a credit card.
  const accounts = cards.filter((c) => c.type !== "credit");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  const color = watch("color");
  const date = watch("date");
  const kind = watch("kind");
  const cardId = watch("cardId");

  // Edit mode: prefill the same form with the movement being edited.
  useEffect(() => {
    if (editing) {
      reset({
        date: editing.date,
        amount: editing.amount.toStorage(),
        kind: editing.kind,
        note: editing.note ?? "",
        color: editing.color,
        cardId: editing.cardId ?? "",
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

  const pending = editing ? updateEntry.isPending : logSavings.isPending;
  const mutationError = editing ? updateEntry.error : logSavings.error;

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updateEntry.mutate({ id: editing.id, ...values }, { onSuccess: handleClose });
    } else {
      logSavings.mutate(values, {
        onSuccess: () => {
          // Keep kind/date/account sticky for rapid logging; clear the amount/note.
          reset({ ...values, amount: "", note: "" });
          closeModal();
        },
      });
    }
  });

  return (
    <Modal
      open={open}
      title={t(editing ? "modals.logSavings.titleEdit" : "modals.logSavings.titleAdd")}
      onClose={handleClose}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label={t("fields.kind")}>
          <div
            className="flex rounded-full border border-white/10 bg-white/5 p-1"
            role="radiogroup"
            aria-label={t("fields.kind")}
          >
            {KIND_OPTIONS.map((option) => {
              const active = kind === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue("kind", option.value, { shouldValidate: true })}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? KIND_TEXT_CLASSES[option.value] : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="savingsKindHighlight"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      className={`absolute inset-0 rounded-full border transition-colors ${KIND_HIGHLIGHT_CLASSES[option.value]}`}
                    />
                  )}
                  <Icon size={14} strokeWidth={2} className="relative shrink-0" />
                  <span className="relative">{savingsKindLabel(t, option.value)}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={t("fields.amount")} error={errors.amount?.message}>
          <input
            {...register("amount", {
              required: t("validation.amountRequired"),
              pattern: { value: AMOUNT_PATTERN, message: t("validation.positiveAmountShort") },
              validate: (v) => Number(v) > 0 || t("validation.amountPositive"),
            })}
            inputMode="decimal"
            placeholder={t("placeholders.amount")}
            className={control}
          />
        </Field>

        <Field label={t("fields.account")}>
          <input type="hidden" {...register("cardId")} />
          <CardSelect
            value={cardId}
            onChange={(v) => setValue("cardId", v, { shouldValidate: true })}
            placeholder={t("placeholders.selectAccountOptional")}
            aria-label={t("fields.account")}
            cards={accounts}
          />
        </Field>

        <Field label={t("fields.date")} error={errors.date?.message}>
          <input type="hidden" {...register("date", { required: t("validation.dateRequired") })} />
          <DatePicker
            value={date}
            onChange={(iso) => setValue("date", iso, { shouldValidate: true })}
            aria-label={t("fields.date")}
          />
        </Field>
        <Field label={t("fields.note")}>
          <input
            {...register("note")}
            placeholder={t("placeholders.note")}
            className={control}
          />
        </Field>
        <Field label={t("fields.color")} className="pb-3">
          <ColorSwatchPicker value={color} onChange={(c) => setValue("color", c)} />
        </Field>
        <Button type="submit" variant="primary" disabled={pending} className="w-full">
          {pending
            ? t("common.saving")
            : editing
              ? t("common.saveChanges")
              : t("modals.logSavings.submit")}
        </Button>
        {mutationError != null && (
          <p className="text-xs text-coral">{(mutationError as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
