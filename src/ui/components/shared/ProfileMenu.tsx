import { Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useUiStore } from "../../../state/uiStore";
import { useSettingsStore } from "../../../state/settingsStore";
import { CardIcon, CoinsIcon, StarIcon, UserIcon } from "./icons";

/** Avatar button + dropdown: the home of account-level actions (per docs/DESIGN.md). */
export function ProfileMenu({ year }: { year: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openModal = useUiStore((s) => s.openModal);
  const displayName = useSettingsStore((s) => s.displayName);
  const initial = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10";

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("profileMenu.label")}
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/15 text-sm font-semibold text-white/90 backdrop-blur hover:bg-white/25"
      >
        {initial || <UserIcon size={18} />}
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
              className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-2xl border border-white/10 bg-panel/90 p-1.5 shadow-xl shadow-black/40 backdrop-blur-2xl"
            >
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
              <div className="mx-3 my-1 border-t border-white/10" />
              <Link to={`/summary/${year}`} className={itemClass} onClick={() => setOpen(false)}>
                <StarIcon size={16} className="text-white/60" />
                {t("common.yearInReview")}
              </Link>
              <Link to="/settings" className={itemClass} onClick={() => setOpen(false)}>
                <Settings size={16} strokeWidth={1.8} className="text-white/60" />
                {t("nav.settings")}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
