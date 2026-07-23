import { LogIn, LogOut, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useUiStore } from "../../../state/uiStore";
import { useAuth } from "../../auth/authContext";
import { useProfile } from "../../hooks/useProfile";
import { THEMES } from "../../theme/themes";
import type { ThemeId } from "../../theme/themes";
import { themeLabel } from "../../i18n/labels";
import { GlassSelect } from "./GlassSelect";
import { CardIcon, CoinsIcon, StarIcon, UserIcon } from "./icons";

/** Avatar button + dropdown: the home of account-level actions (per docs/DESIGN.md). */
export function ProfileMenu({ year }: { year: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openModal = useUiStore((s) => s.openModal);
  const { isCloudEnabled, user, signOut } = useAuth();
  const { displayName, email, avatarUrl, signedIn, theme, setTheme } = useProfile();
  const initial =
    displayName.trim().charAt(0).toUpperCase() || (email?.charAt(0).toUpperCase() ?? "");
  const secondary = signedIn ? (displayName ? email : null) : t("profileMenu.localDevice");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/10";

  // Each option shows the theme name + a round swatch blending its three accent colors — except
  // Casino, which gets a little red poker chip (white edge spots + inner ring) for character.
  const themeOptions = THEMES.map((meta) => {
    // Default reads as its signature blue rather than the peri→mint→coral blend.
    const gradient =
      meta.id === "default"
        ? "linear-gradient(135deg, #a5b4fc, #818cf8, #2536e8)"
        : `linear-gradient(135deg, ${meta.swatch[0]}, ${meta.swatch[1]}, ${meta.swatch[2]})`;
    return {
      value: meta.id,
      label: themeLabel(t, meta.id),
      leading:
        meta.id === "casino" ? (
          <svg viewBox="0 0 24 24" aria-hidden className="block size-4">
            <circle cx="12" cy="12" r="11.5" fill="#c1121f" />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeDasharray="3.4 7"
            />
            <circle cx="12" cy="12" r="6.2" fill="none" stroke="#ffffff" strokeWidth="1.2" />
          </svg>
        ) : (
          <span
            className="block size-4 rounded-full ring-1 ring-black/20"
            style={{ backgroundImage: gradient }}
          />
        ),
    };
  });

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("profileMenu.label")}
        aria-expanded={open}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/15 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/25"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          initial || <UserIcon size={18} />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              className="absolute right-0 z-50 mt-2 w-[18.5rem] origin-top-right rounded-2xl border border-white/10 bg-panel/90 p-2 shadow-xl shadow-black/40 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/15 text-sm font-semibold text-white/90">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    initial || <UserIcon size={18} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {displayName || email || t("profileMenu.guest")}
                  </span>
                  {secondary && (
                    <span className="block truncate text-xs text-white/50">{secondary}</span>
                  )}
                </span>
              </div>
              <div className="mx-3 my-1 border-t border-white/10" />
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  openModal("manageCards");
                }}
              >
                <CardIcon size={16} className="text-white/60" />
                {t("profileMenu.cardsAccounts")}
              </button>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  openModal("logSavings");
                }}
              >
                <CoinsIcon size={16} className="text-white/60" />
                {t("profileMenu.logSavings")}
              </button>

              {/* Quick theme switch — premium themes only apply when signed in. */}
              {signedIn && (
                <>
                  <div className="mx-3 my-1 border-t border-white/10" />
                  <div className="px-1.5 py-1.5">
                    <p className="mb-1.5 px-1.5 text-xs text-white/40">{t("settings.theme")}</p>
                    <GlassSelect
                      value={theme}
                      onChange={(v) => void setTheme(v as ThemeId)}
                      options={themeOptions}
                      aria-label={t("settings.theme")}
                      placeholder={t("settings.theme")}
                    />
                  </div>
                </>
              )}

              <div className="mx-3 my-1 border-t border-white/10" />
              <Link to={`/summary/${year}`} className={itemClass} onClick={() => setOpen(false)}>
                <StarIcon size={16} className="text-white/60" />
                {t("common.yearInReview")}
              </Link>
              <Link to="/settings" className={itemClass} onClick={() => setOpen(false)}>
                <Settings size={16} strokeWidth={1.8} className="text-white/60" />
                {t("nav.settings")}
              </Link>
              {isCloudEnabled && (
                <>
                  <div className="mx-3 my-1 border-t border-white/10" />
                  {user ? (
                    <button
                      type="button"
                      className={itemClass}
                      onClick={() => {
                        setOpen(false);
                        void signOut();
                      }}
                    >
                      <LogOut size={16} strokeWidth={1.8} className="text-white/60" />
                      {t("auth.signOut")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={itemClass}
                      onClick={() => {
                        setOpen(false);
                        openModal("signIn");
                      }}
                    >
                      <LogIn size={16} strokeWidth={1.8} className="text-white/60" />
                      {t("auth.signIn")}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
