import { useTranslation } from "react-i18next";
import { OnboardingCta } from "../OnboardingLayout";

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
        <img src="/favicon/favicon-128x128.png" alt="" className="size-10 rounded-xl" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{t("onboarding.welcomeTitle")}</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
        {t("onboarding.welcomeSubtitle")}
      </p>
      <div className="mt-6">
        <OnboardingCta onClick={onContinue}>{t("onboarding.getStarted")}</OnboardingCta>
      </div>
    </div>
  );
}
