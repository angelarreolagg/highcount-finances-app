import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/authContext";
import { useProfile } from "../../hooks/useProfile";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { OnboardingCta, OnboardingSkip } from "../OnboardingLayout";

/** "Presenting the app" intro: the logo springs in, then the welcome copy cascades up under it. */
const introContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const introLogo = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, bounce: 0.4 } },
};
const introItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
};

/** First setup step: the user's name (pre-filled from a Google account when available). */
export function NameStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { displayName, setDisplayName } = useProfile();
  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const [name, setName] = useState(displayName || meta?.full_name || meta?.name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await setDisplayName(name.trim());
      onContinue();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-center">
      <motion.div variants={introContainer} initial="hidden" animate="visible">
        <motion.div
          variants={introLogo}
          className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15"
        >
          <img src="/favicon/favicon-128x128.png" alt="" className="size-10 rounded-xl" />
        </motion.div>
        <motion.h1 variants={introItem} className="text-2xl font-bold tracking-tight">
          {t("onboarding.nameTitle")}
        </motion.h1>
        <motion.p variants={introItem} className="mx-auto mt-2 max-w-xs text-sm text-white/60">
          {t("onboarding.nameSubtitle")}
        </motion.p>
      </motion.div>

      <div className="mt-6 text-left">
        <Field label={t("settings.displayName")}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("settings.displayNamePlaceholder")}
            autoComplete="off"
            autoFocus
            className={control}
          />
        </Field>
      </div>

      <div className="mt-6 space-y-3">
        <OnboardingCta onClick={() => void save()} disabled={saving}>
          {saving ? t("common.saving") : t("onboarding.continue")}
        </OnboardingCta>
        <OnboardingSkip onClick={onContinue}>{t("onboarding.skip")}</OnboardingSkip>
      </div>
    </div>
  );
}
