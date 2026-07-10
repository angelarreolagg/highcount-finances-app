import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useUiStore } from "../../../state/uiStore";
import { CardIcon, CoinsIcon, StarIcon, UserIcon } from "./icons";

/** Avatar button + dropdown: the home of account-level actions (per docs/DESIGN.md). */
export function ProfileMenu({ year }: { year: number }) {
  const [open, setOpen] = useState(false);
  const openModal = useUiStore((s) => s.openModal);

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
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white/90 backdrop-blur hover:bg-white/25"
      >
        <UserIcon size={18} />
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
                Cards & accounts
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
                Log savings
              </button>
              <div className="mx-3 my-1 border-t border-white/10" />
              <Link to={`/summary/${year}`} className={itemClass} onClick={() => setOpen(false)}>
                <StarIcon size={16} className="text-white/60" />
                Year in Review
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
