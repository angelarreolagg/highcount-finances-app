import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/authContext";
import { useProfile } from "../../hooks/useProfile";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { riseIn } from "../../components/shared/motionPresets";
import { OnboardingCta, OnboardingMark, OnboardingSkip } from "../OnboardingLayout";

/** The card's contents cascade up under the mark — delayed so they follow it in, not race it. */
const cardContents = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
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
      {/* Not inside the staggered block on purpose: the mark ARRIVES from the intro on its shared
          layoutId, so it must never be re-animated from opacity 0 here. */}
      <div className="mb-5">
        <OnboardingMark size="card" />
      </div>

      <motion.div variants={cardContents} initial="hidden" animate="visible">
        <motion.h1 variants={riseIn} className="text-2xl font-bold tracking-tight">
          {t("onboarding.nameTitle")}
        </motion.h1>
        <motion.p variants={riseIn} className="mx-auto mt-2 max-w-xs text-sm text-white/60">
          {t("onboarding.nameSubtitle")}
        </motion.p>

        <motion.div variants={riseIn} className="mt-6 text-left">
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
        </motion.div>

        <motion.div variants={riseIn} className="mt-6 space-y-3">
          <OnboardingCta onClick={() => void save()} disabled={saving}>
            {saving ? t("common.saving") : t("onboarding.continue")}
          </OnboardingCta>
          <OnboardingSkip onClick={onContinue}>{t("onboarding.skip")}</OnboardingSkip>
        </motion.div>
      </motion.div>
    </div>
  );
}
