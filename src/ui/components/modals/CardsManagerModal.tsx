import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Card, CardType } from "../../../domain/entities/Card";
import { useUiStore } from "../../../state/uiStore";
import { useAddCard, useCards, useUpdateCard } from "../../hooks/useDashboardData";
import { cardTypeLabel, seedLabel } from "../../i18n/labels";
import { randomCardColor } from "../../utils/chips";
import { Button } from "../shared/Button";
import { CardVisual } from "../shared/CardVisual";
import { ColorField } from "../shared/ColorField";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { ArrowLeftIcon, PlusIcon } from "../shared/icons";
import { Modal } from "../shared/Modal";
import { RowActions } from "../shared/RowActions";

interface FormValues {
  name: string;
  type: CardType;
  cutDay: string;
  paymentDueDay: string;
  color?: string;
  last4?: string;
  creditLimit: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

const TYPE_VALUES: CardType[] = ["credit", "debit", "cash"];

const viewTransition = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

export function CardsManagerModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.activeModal === "manageCards");
  const closeModal = useUiStore((s) => s.closeModal);
  const openDelete = useUiStore((s) => s.openDelete);
  const { data: cards = [] } = useCards();
  const addCard = useAddCard();
  const updateCard = useUpdateCard();
  const [view, setView] = useState<"list" | "form">("list");
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "credit",
      cutDay: "",
      paymentDueDay: "",
      color: undefined,
      last4: "",
      creditLimit: "",
    },
  });

  const name = watch("name");
  const type = watch("type");
  const cutDay = watch("cutDay");
  const paymentDueDay = watch("paymentDueDay");
  const color = watch("color");
  const last4 = watch("last4");

  const dayRules = {
    required: t("validation.dayRequiredCredit"),
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= 31) || t("validation.dayRange");
    },
  };

  const backToList = () => {
    reset();
    setEditingCard(null);
    setView("list");
  };

  const handleClose = () => {
    closeModal();
    backToList();
  };

  const startNew = () => {
    setEditingCard(null);
    // A fresh random color each time a new card is started (edits keep their own color).
    reset({
      name: "",
      type: "credit",
      cutDay: "",
      paymentDueDay: "",
      color: randomCardColor(),
      last4: "",
      creditLimit: "",
    });
    setView("form");
  };

  const startEdit = (card: Card) => {
    setEditingCard(card);
    reset({
      name: card.name,
      type: card.type,
      cutDay: card.cutDay != null ? String(card.cutDay) : "",
      paymentDueDay: card.paymentDueDay != null ? String(card.paymentDueDay) : "",
      color: card.color,
      last4: card.last4 ?? "",
      creditLimit: card.creditLimit?.toStorage() ?? "",
    });
    setView("form");
  };

  const pending = editingCard ? updateCard.isPending : addCard.isPending;
  const mutationError = editingCard ? updateCard.error : addCard.error;

  const onSubmit = handleSubmit((values) => {
    const input = {
      name: values.name,
      type: values.type,
      cutDay: values.type === "credit" ? Number(values.cutDay) : undefined,
      paymentDueDay: values.type === "credit" ? Number(values.paymentDueDay) : undefined,
      color: values.color,
      last4: values.last4,
      creditLimit: values.type === "credit" ? values.creditLimit : undefined,
    };
    if (editingCard) {
      updateCard.mutate({ id: editingCard.id, ...input }, { onSuccess: backToList });
    } else {
      addCard.mutate(input, { onSuccess: backToList });
    }
  });

  return (
    <Modal
      open={open}
      size="wide"
      title={
        view === "list"
          ? t("modals.cards.titleList")
          : editingCard
            ? t("modals.cards.titleEdit")
            : t("modals.cards.titleNew")
      }
      onClose={handleClose}
    >
      <AnimatePresence mode="wait" initial={false}>
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={viewTransition}
          >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {cards.map((c) => (
                <div key={c.id} className="group relative">
                  <CardVisual
                    name={seedLabel(t, c.id, c.name)}
                    type={c.type}
                    color={c.color}
                    last4={c.last4}
                    cutDay={c.cutDay}
                    paymentDueDay={c.paymentDueDay}
                    contentClassName="pr-14"
                  />
                  <div className="absolute right-2 bottom-2">
                    <RowActions
                      label={seedLabel(t, c.id, c.name)}
                      onEdit={() => startEdit(c)}
                      onDelete={() => openDelete({ type: "card", card: c })}
                    />
                  </div>
                </div>
              ))}
              {/* Add tile completes the grid. */}
              <button
                type="button"
                onClick={startNew}
                className="flex aspect-[16/10] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/20 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                <PlusIcon size={20} />
                <span className="text-xs font-medium">{t("modals.cards.addTile")}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={viewTransition}
            onSubmit={onSubmit}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={backToList}
              className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white"
            >
              <ArrowLeftIcon size={14} />
              {t("modals.cards.allCardsAccounts")}
            </button>

            {/* Cap the preview to a real card size so it doesn't stretch to the wide
                modal width (which made it huge at lg/2xl). */}
            <CardVisual
              name={name}
              type={type}
              color={color}
              last4={last4}
              cutDay={type === "credit" ? cutDay : undefined}
              paymentDueDay={type === "credit" ? paymentDueDay : undefined}
              className="mx-auto w-full max-w-xs"
            />

            {/* Segmented type control with a sliding highlight (drives the RHF `type` value). */}
            <div
              className="flex rounded-full border border-white/10 bg-white/5 p-1"
              role="radiogroup"
              aria-label={t("fields.type")}
            >
              {TYPE_VALUES.map((value) => {
                const active = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setValue("type", value, { shouldValidate: true })}
                    className={`relative flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? "text-white" : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="cardTypeHighlight"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className="absolute inset-0 rounded-full border border-peri/40 bg-peri/25"
                      />
                    )}
                    <span className="relative">{cardTypeLabel(t, value)}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label={t("fields.name")} error={errors.name?.message}>
                <input
                  {...register("name", { required: t("validation.nameRequired") })}
                  placeholder={t("placeholders.name")}
                  autoComplete="off"
                  className={control}
                />
              </Field>
              <Field label={t("fields.last4")}>
                <input
                  {...register("last4")}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={t("placeholders.last4")}
                  autoComplete="off"
                  className={`${control} w-24 text-center tabular-nums`}
                />
              </Field>
            </div>

            <Field label={t("fields.color")}>
              <ColorField value={color} onChange={(c) => setValue("color", c)} />
            </Field>

            <AnimatePresence initial={false}>
              {type === "credit" && (
                <motion.div
                  key="creditDays"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <Field label={t("fields.cutDay")} error={errors.cutDay?.message}>
                      <input
                        {...register("cutDay", dayRules)}
                        inputMode="numeric"
                        placeholder={t("placeholders.cutDay")}
                        className={control}
                      />
                    </Field>
                    <Field label={t("fields.paymentDueDay")} error={errors.paymentDueDay?.message}>
                      <input
                        {...register("paymentDueDay", dayRules)}
                        inputMode="numeric"
                        placeholder={t("placeholders.paymentDueDay")}
                        className={control}
                      />
                    </Field>
                    <Field
                      label={t("fields.creditLimit")}
                      error={errors.creditLimit?.message}
                      className="col-span-2 pb-4"
                    >
                      <input
                        {...register("creditLimit", {
                          required: t("validation.creditLimitRequired"),
                          pattern: {
                            value: AMOUNT_PATTERN,
                            message: t("validation.creditLimitPattern"),
                          },
                          validate: (v) => Number(v) > 0 || t("validation.greaterThanZero"),
                        })}
                        inputMode="decimal"
                        placeholder={t("placeholders.creditLimit")}
                        className={control}
                      />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={pending} className="flex-1">
                {pending
                  ? t("common.saving")
                  : editingCard
                    ? t("common.saveChanges")
                    : t("modals.cards.submitAdd")}
              </Button>
              <Button type="button" onClick={backToList}>
                {t("common.cancel")}
              </Button>
            </div>
            {mutationError != null && (
              <p className="text-xs text-coral">{(mutationError as Error).message}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
