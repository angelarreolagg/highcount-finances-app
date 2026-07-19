import { useTranslation } from "react-i18next";
import { PageShell } from "../components/layout/PageShell";
import { GlassCard } from "../components/shared/GlassCard";
import { GlassSelect } from "../components/shared/GlassSelect";
import { Field } from "../components/shared/Field";
import { control } from "../components/shared/formStyles";
import { useSettingsStore } from "../../state/settingsStore";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <PageShell
      hero={
        <div className="pt-10 pb-6 text-center lg:pt-14">
          <p className="text-sm text-white/70">{t("settings.heroLabel")}</p>
          <h1 className="mt-2 text-4xl font-bold lg:text-5xl">{t("settings.title")}</h1>
        </div>
      }
    >
      <div className="mx-auto max-w-xl space-y-4 pt-2">
        <GlassCard title={t("settings.profile")}>
          <Field label={t("settings.displayName")}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("settings.displayNamePlaceholder")}
              autoComplete="off"
              className={control}
            />
          </Field>
          <p className="mt-2 text-xs text-white/40">{t("settings.displayNameHint")}</p>
        </GlassCard>

        <GlassCard title={t("settings.preferences")}>
          <Field label={t("settings.language")}>
            <GlassSelect
              value={language}
              onChange={(v) => void i18n.changeLanguage(v)}
              aria-label={t("settings.language")}
              placeholder={t("settings.language")}
              options={[
                { value: "en", label: t("settings.english") },
                { value: "es", label: t("settings.spanish") },
              ]}
            />
          </Field>
        </GlassCard>

        <GlassCard title={t("settings.about")}>
          <p className="text-sm text-white/60">{t("settings.aboutText")}</p>
        </GlassCard>
      </div>
    </PageShell>
  );
}
