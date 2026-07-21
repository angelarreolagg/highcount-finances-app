import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Money } from "../../../domain/value-objects/Money";
import { toISODate } from "../../../domain/value-objects/calendar";
import {
  useAddTransaction,
  useCards,
  useCategories,
  useCreditByCard,
} from "../../hooks/useDashboardData";
import { seedLabel } from "../../i18n/labels";
import { categoryIcon } from "../../utils/categoryIcons";
import { Button } from "../../components/shared/Button";
import { CardSelect } from "../../components/shared/CardSelect";
import { DatePicker } from "../../components/shared/DatePicker";
import { Field } from "../../components/shared/Field";
import { IconSelect } from "../../components/shared/IconSelect";
import { control } from "../../components/shared/formStyles";
import { OnboardingCta, OnboardingSkip } from "../OnboardingLayout";

interface ExpenseForm {
  amount: string;
  categoryId: string;
  cardId: string;
  date: string;
  description: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const QUICK_AMOUNTS = [10, 100, 200, 500, 1000];

export function ExpenseStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const addTransaction = useAddTransaction();
  const { data: categories = [] } = useCategories();
  const { data: cards = [] } = useCards();
  const { data: creditByCard } = useCreditByCard();
  const [logged, setLogged] = useState(false);

  const availableByCard = creditByCard
    ? new Map([...creditByCard].map(([id, u]) => [id, u.available]))
    : undefined;
  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ExpenseForm>({
    defaultValues: { amount: "", categoryId: "", cardId: "account-cash", date: toISODate(new Date()), description: "" },
  });

  const categoryId = watch("categoryId");
  const cardId = watch("cardId");
  const date = watch("date");

  const bump = (n: number) => {
    const current = Money.from(getValues("amount") || "0");
    setValue("amount", current.add(Money.from(n)).round2().toStorage(), { shouldValidate: true });
  };

  const onSubmit = handleSubmit((v) => {
    addTransaction.mutate(
      { type: "expense", ...v },
      { onSuccess: () => setLogged(true) },
    );
  });

  if (logged) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-mint/15 text-mint ring-1 ring-mint/30">
          <PartyPopper size={26} strokeWidth={1.8} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{t("onboarding.congratsTitle")}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
          {t("onboarding.congratsBody")}
        </p>
        <div className="mt-6">
          <OnboardingCta onClick={onContinue}>{t("onboarding.continue")}</OnboardingCta>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t("onboarding.expenseTitle")}</h1>
      <p className="mt-1 text-sm text-white/60">{t("onboarding.expenseBody")}</p>

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

        <Field label={t("fields.category")} error={errors.categoryId?.message}>
          <input type="hidden" {...register("categoryId", { required: t("validation.categoryRequired") })} />
          <IconSelect
            value={categoryId}
            onChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
            placeholder={t("placeholders.selectCategory")}
            aria-label={t("fields.category")}
            options={expenseCategories.map((c) => ({
              value: c.id,
              label: seedLabel(t, c.id, c.name),
              icon: categoryIcon(c.name),
            }))}
          />
        </Field>

        <Field label={t("fields.cardAccount")} error={errors.cardId?.message}>
          <input type="hidden" {...register("cardId", { required: t("validation.cardRequired") })} />
          <CardSelect
            value={cardId}
            onChange={(v) => setValue("cardId", v, { shouldValidate: true })}
            placeholder={t("placeholders.selectAccount")}
            aria-label={t("fields.cardAccount")}
            cards={cards}
            availableByCard={availableByCard}
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
          {addTransaction.isPending ? t("common.saving") : t("onboarding.logExpense")}
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
