import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useThemeTransitionStore } from "../../state/themeTransitionStore";
import { useAuth } from "../auth/authContext";
import { useProfile } from "../hooks/useProfile";

const OAUTH_FLAG = "highcount:oauth-pending";
const MIN_COVER_MS = 450; // hold the cover briefly so both the fade-in and fade-out read smoothly
const MAX_COVER_MS = 2500; // safety net — never let the overlay stick if the fetch hangs

/**
 * Full-screen cover for auth transitions.
 *   - Sign-in / account switch / OAuth return: the cloud theme is fetched a beat after paint, so the
 *     previous account's cached theme would flash first (see useProfile). We drop the overlay
 *     INSTANTLY to mask it, then fade it out once the profile (theme) has resolved.
 *   - Sign-out: fade TO black, let the redirect to /login happen underneath, then fade back in.
 * Plain reloads are NOT covered (the local cache already paints the right theme instantly).
 */
export function ThemeTransition() {
  const { user, authReady } = useAuth();
  const { profileLoaded } = useProfile();
  const covering = useThemeTransitionStore((s) => s.covering);
  const fadeIn = useThemeTransitionStore((s) => s.fadeIn);
  const startCover = useThemeTransitionStore((s) => s.startCover);
  const endCover = useThemeTransitionStore((s) => s.endCover);
  const coverStart = useRef(0);
  const baselineSet = useRef(false);
  const prevUserId = useRef<string | null>(null);

  // Trigger 1 — OAuth return: a full page reload carrying the pending-oauth flag set before redirect.
  useEffect(() => {
    if (sessionStorage.getItem(OAUTH_FLAG)) {
      sessionStorage.removeItem(OAUTH_FLAG);
      coverStart.current = Date.now();
      startCover(false); // instant — mask the theme flash
    }
  }, [startCover]);

  // Trigger 2 — in-app auth change. Skip the initial resolution (reload / OAuth load), then cover on
  // any identity change: a new signed-in id (sign-in/switch) covers instantly; sign-out (→ null)
  // fades to black as a page transition into /login.
  useEffect(() => {
    if (!authReady) return;
    const now = user?.id ?? null;
    if (!baselineSet.current) {
      baselineSet.current = true;
      prevUserId.current = now;
      return;
    }
    if (now !== prevUserId.current) {
      coverStart.current = Date.now();
      startCover(now === null); // fade-in on sign-out, instant on sign-in
    }
    prevUserId.current = now;
  }, [authReady, user?.id, startCover]);

  // Uncover once the profile is resolved (guest / signed-out: immediately). Min display for a smooth
  // fade, max as a safety net so a hung fetch can never trap the user behind the overlay.
  useEffect(() => {
    if (!covering) return;
    const ready = authReady && profileLoaded;
    if (!ready) {
      const maxId = setTimeout(endCover, MAX_COVER_MS);
      return () => clearTimeout(maxId);
    }
    const remaining = Math.max(0, MIN_COVER_MS - (Date.now() - coverStart.current));
    const id = setTimeout(endCover, remaining);
    return () => clearTimeout(id);
  }, [covering, authReady, profileLoaded, endCover]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          key="theme-cover"
          initial={fadeIn ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          aria-hidden="true"
          className="fixed inset-0 z-[100]"
          style={{ backgroundColor: "#05060e" }}
        />
      )}
    </AnimatePresence>
  );
}
