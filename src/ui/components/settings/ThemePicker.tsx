import { useTranslation } from "react-i18next";
import { Check, Lock } from "lucide-react";
import { useUiStore } from "../../../state/uiStore";
import { useAuth } from "../../auth/authContext";
import { useProfile } from "../../hooks/useProfile";
import { THEMES } from "../../theme/themes";
import type { ThemeMeta } from "../../theme/themes";
import { themeLabel } from "../../i18n/labels";
import { Button } from "../shared/Button";

/**
 * Swatch-grid theme picker. Premium themes are unlocked for any signed-in account; guests see a
 * lock badge and a sign-in upsell (or, when cloud sync isn't configured at all, an explanatory
 * note). Selecting a tile writes through `useProfile.setTheme` — persisted to the cloud profile
 * for signed-in users (syncs across devices) and the local store otherwise; `useApplyTheme`
 * reflects it onto <html data-theme> live.
 */
export function ThemePicker() {
  const { t } = useTranslation();
  const { theme, setTheme, signedIn: eligible } = useProfile();
  const openModal = useUiStore((s) => s.openModal);
  const { isCloudEnabled } = useAuth();

  const select = (meta: ThemeMeta) => {
    const locked = meta.premium && !eligible;
    if (locked) {
      if (isCloudEnabled) openModal("signIn");
      return;
    }
    void setTheme(meta.id);
  };

  return (
    <div>
      <p className="mb-2 text-xs text-white/40">{t("settings.theme")}</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {THEMES.map((meta) => {
          const active = meta.id === theme;
          const locked = meta.premium && !eligible;
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => select(meta)}
              aria-pressed={active}
              aria-label={themeLabel(t, meta.id)}
              className={`relative flex flex-col gap-2 rounded-2xl border p-3 text-left transition ${
                active
                  ? "border-peri/60 bg-white/10 ring-1 ring-peri/50"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              } ${locked ? "opacity-60" : ""}`}
            >
              <span className="flex items-center gap-1.5" aria-hidden>
                {meta.swatch.map((hex, i) => (
                  <span
                    key={i}
                    className="size-4 rounded-full ring-1 ring-black/20"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate">{themeLabel(t, meta.id)}</span>
                {active && <Check size={15} className="shrink-0 text-peri" />}
                {locked && <Lock size={13} className="shrink-0 text-white/50" />}
              </span>
              {meta.premium && (
                <span className="text-[0.65rem] tracking-wide text-white/35 uppercase">
                  {t("settings.themePremium")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!eligible &&
        (isCloudEnabled ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-xs text-white/50">{t("settings.themeLockedHint")}</p>
            <Button type="button" variant="primary" onClick={() => openModal("signIn")}>
              {t("settings.themeSignInCta")}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-white/50">{t("settings.themeUnavailable")}</p>
        ))}
    </div>
  );
}
