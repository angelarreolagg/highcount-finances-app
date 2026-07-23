import { Landmark } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Money } from "../../../domain/value-objects/Money";
import { useProfile } from "../../hooks/useProfile";
import { Button } from "../../components/shared/Button";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { OnboardingSkip } from "../OnboardingLayout";

interface SalaryForm {
  amount: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Setup step (after the first income): the user's average monthly salary — the sole basis for the
 * runway estimate (see riskIndicator.ts). Saved to the profile via useProfile, exactly like Settings.
 * Optional: skipping leaves the salary unset (runway stays "unknown"). Not the last step, so it
 * advances straight on save with no success screen.
 */
export function SalaryStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const { setAverageMonthlySalary } = useProfile();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalaryForm>({ defaultValues: { amount: "" } });

  const onSubmit = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await setAverageMonthlySalary(Money.from(v.amount).round2().toStorage());
      onContinue();
    } finally {
      setSaving(false);
    }
  });

  return (
    <div>
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-peri/15 text-peri ring-1 ring-peri/30">
        <Landmark size={26} strokeWidth={1.8} />
      </div>
      <h1 className="text-xl font-bold tracking-tight">{t("onboarding.salary.title")}</h1>
      <p className="mt-1 text-sm text-white/60">{t("onboarding.salary.body")}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <Field label={t("onboarding.salary.label")} error={errors.amount?.message}>
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
          <p className="mt-2 text-xs text-white/40">{t("onboarding.salary.hint")}</p>
        </Field>

        <Button type="submit" variant="primary" disabled={saving} className="w-full">
          {saving ? t("common.saving") : t("onboarding.salary.submit")}
        </Button>
      </form>

      <div className="mt-5">
        <OnboardingSkip onClick={onContinue}>{t("onboarding.skip")}</OnboardingSkip>
      </div>
    </div>
  );
}
