import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { CardType } from "../../../domain/entities/Card";
import { useAddCard, useCards } from "../../hooks/useDashboardData";
import { cardTypeLabel } from "../../i18n/labels";
import { randomCardColor } from "../../utils/chips";
import { Button } from "../../components/shared/Button";
import { CardVisual } from "../../components/shared/CardVisual";
import { ColorField } from "../../components/shared/ColorField";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { OnboardingCta, OnboardingSkip } from "../OnboardingLayout";

interface CardForm {
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

const freshDefaults = (): CardForm => ({
  name: "",
  type: "credit",
  cutDay: "",
  paymentDueDay: "",
  color: randomCardColor(),
  last4: "",
  creditLimit: "",
});

export function CardsStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const addCard = useAddCard();
  const { data: cards = [] } = useCards();
  const userCards = cards.filter((c) => c.id !== "account-cash");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CardForm>({ defaultValues: freshDefaults() });

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

  const onSubmit = handleSubmit((v) => {
    addCard.mutate(
      {
        name: v.name,
        type: v.type,
        cutDay: v.type === "credit" ? Number(v.cutDay) : undefined,
        paymentDueDay: v.type === "credit" ? Number(v.paymentDueDay) : undefined,
        color: v.color,
        last4: v.last4,
        creditLimit: v.type === "credit" ? v.creditLimit : undefined,
      },
      { onSuccess: () => reset(freshDefaults()) },
    );
  });

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t("onboarding.cardsTitle")}</h1>
      <p className="mt-1 text-sm text-white/60">{t("onboarding.cardsJoke")}</p>

      {userCards.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {userCards.map((c) => (
            <CardVisual key={c.id} name={c.name} type={c.type} color={c.color} last4={c.last4} />
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <CardVisual
          name={name}
          type={type}
          color={color}
          last4={last4}
          cutDay={type === "credit" ? cutDay : undefined}
          paymentDueDay={type === "credit" ? paymentDueDay : undefined}
          className="mx-auto w-full max-w-[13rem]"
        />

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
                    layoutId="onboardingCardType"
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
                  className="col-span-2"
                >
                  <input
                    {...register("creditLimit", {
                      required: t("validation.creditLimitRequired"),
                      pattern: { value: AMOUNT_PATTERN, message: t("validation.creditLimitPattern") },
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

        <Button type="submit" disabled={addCard.isPending} className="w-full">
          {addCard.isPending ? t("common.saving") : t("onboarding.addCard")}
        </Button>
        {addCard.error != null && (
          <p className="text-xs text-coral">{(addCard.error as Error).message}</p>
        )}
      </form>

      <div className="mt-5 space-y-3">
        <OnboardingCta onClick={onContinue}>{t("onboarding.continue")}</OnboardingCta>
        <OnboardingSkip onClick={onContinue}>{t("onboarding.skip")}</OnboardingSkip>
      </div>
    </div>
  );
}
