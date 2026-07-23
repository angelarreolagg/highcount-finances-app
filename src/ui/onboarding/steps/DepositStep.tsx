import { Wallet } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Money } from "../../../domain/value-objects/Money";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useAddTransaction, useCards } from "../../hooks/useDashboardData";
import { Button } from "../../components/shared/Button";
import { CardSelect } from "../../components/shared/CardSelect";
import { DatePicker } from "../../components/shared/DatePicker";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { OnboardingCta, OnboardingSkip } from "../OnboardingLayout";

interface DepositForm {
  amount: string;
  cardId: string;
  date: string;
  description: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

/**
 * Optional setup step: log the user's first income so their balance starts from the right place.
 * Recorded as an income transaction (type "income", tagged with the seeded Salary category) into
 * the chosen account — not a savings movement. Skipping (or logging) advances the wizard.
 */
export function DepositStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const addTransaction = useAddTransaction();
  const { data: cards = [] } = useCards();
  const [logged, setLogged] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<DepositForm>({
    defaultValues: { amount: "", cardId: "", date: toISODate(new Date()), description: "" },
  });

  const cardId = watch("cardId");
  const date = watch("date");

  const bump = (n: number) => {
    const current = Money.from(getValues("amount") || "0");
    setValue("amount", current.add(Money.from(n)).round2().toStorage(), { shouldValidate: true });
  };

  const onSubmit = handleSubmit((v) => {
    addTransaction.mutate(
      {
        type: "income",
        categoryId: "cat-salary",
        cardId: v.cardId,
        amount: v.amount,
        date: v.date,
        description: v.description,
      },
      { onSuccess: () => setLogged(true) },
    );
  });

  if (logged) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-mint/15 text-mint ring-1 ring-mint/30">
          <Wallet size={26} strokeWidth={1.8} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{t("onboarding.deposit.successTitle")}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
          {t("onboarding.deposit.successBody")}
        </p>
        <div className="mt-6">
          <OnboardingCta onClick={onContinue}>{t("onboarding.continue")}</OnboardingCta>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t("onboarding.deposit.title")}</h1>
      <p className="mt-1 text-sm text-white/60">{t("onboarding.deposit.body")}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <Field label={t("fields.amount")} error={errors.amount?.message}>
          <input
            {...register("amount", {
              required: t("validation.amountRequired"),
              pattern: { value: AMOUNT_PATTERN, message: t("validation.positiveAmount") },
              validate: (v) => Number(v) > 0 || t("validation.amountPositive"),
            })}
            inputMode="decimal"
            placeholder={t("placeholders.amount")}
            className={control}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => bump(n)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                +{n}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("onboarding.deposit.account")} error={errors.cardId?.message}>
          <input type="hidden" {...register("cardId", { required: t("validation.cardRequired") })} />
          <CardSelect
            value={cardId}
            onChange={(v) => setValue("cardId", v, { shouldValidate: true })}
            placeholder={t("placeholders.selectAccount")}
            aria-label={t("onboarding.deposit.account")}
            cards={cards}
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

        <Field label={t("fields.description")}>
          <input
            {...register("description")}
            placeholder={t("placeholders.descriptionWhat")}
            className={control}
          />
        </Field>

        <Button type="submit" variant="primary" disabled={addTransaction.isPending} className="w-full">
          {addTransaction.isPending ? t("common.saving") : t("onboarding.deposit.submit")}
        </Button>
        {addTransaction.error != null && (
          <p className="text-xs text-coral">{(addTransaction.error as Error).message}</p>
        )}
      </form>

      <div className="mt-5">
        <OnboardingSkip onClick={onContinue}>{t("onboarding.skip")}</OnboardingSkip>
      </div>
    </div>
  );
}
