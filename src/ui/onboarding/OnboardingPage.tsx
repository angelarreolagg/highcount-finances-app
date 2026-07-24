import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useProfile } from "../hooks/useProfile";
import { introElapsedMs, useIntroClock } from "./introPlayback";
import {
  OnboardingLayout,
  OnboardingMark,
  OnboardingScene,
  OnboardingWordmark,
} from "./OnboardingLayout";
import { CardsStep } from "./steps/CardsStep";
import { DepositStep } from "./steps/DepositStep";
import { ExpenseStep } from "./steps/ExpenseStep";
import { NameStep } from "./steps/NameStep";
import { SalaryStep } from "./steps/SalaryStep";

/** How long the brand beat holds before handing off, measured from when it first became visible. */
const INTRO_HOLD_MS = 2000;
/** Whatever the splash already used up, keep this much tail so the handoff never reads as cut. */
const MIN_TAIL_MS = 700;

/**
 * Setup wizard: your name → cards → initial deposit → first expense → dashboard. Reached from
 * /login's "continue without an account" and for new signed-in accounts with no data.
 *
 * The opening is ONE continuous scene, never a screen swap: the stage (`OnboardingScene`) stays
 * mounted throughout, the wordmark blurs away, and the brand mark *travels* from the centered hero
 * slot into the name card's header on its shared `layoutId` while the card fades up around it.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const { setOnboardingComplete } = useProfile();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"intro" | "wizard">("intro");
  // `startedBefore` = the gate's splash already showed this same intro, so we continue its beat
  // instead of restarting or truncating it; `covered` = the auth cover is still hiding the screen.
  const { covered, startedBefore } = useIntroClock();

  useEffect(() => {
    if (covered) return; // the beat hasn't visibly begun yet — don't spend it behind the cover
    const hold = startedBefore
      ? Math.max(INTRO_HOLD_MS - introElapsedMs(), MIN_TAIL_MS)
      : INTRO_HOLD_MS;
    const id = setTimeout(() => setPhase("wizard"), hold);
    return () => clearTimeout(id);
  }, [covered, startedBefore]);

  const steps = ["name", "cards", "deposit", "salary", "expense"] as const;
  const current = steps[Math.min(step, steps.length - 1)];

  // Records completion on the account (cloud profile when signed in), so this wizard never runs
  // again on any device. A failed write still lets the user through — the gate's data probe
  // self-heals the flag on the next load.
  const finish = async () => {
    try {
      await setOnboardingComplete(true);
    } catch (error) {
      console.error("Could not save onboarding completion.", error);
    }
    navigate("/");
  };
  const next = () => {
    if (step >= steps.length - 1) void finish();
    else setStep((s) => s + 1);
  };

  const progress = { current: step + 1, total: steps.length };

  return (
    <OnboardingScene>
      {/* The mark lives here only during the intro; on the flip it unmounts in the same commit as
          the name step's mark mounts, which is what makes Motion fly it into the card. */}
      {phase === "intro" && (
        <motion.div
          initial={startedBefore ? false : { opacity: 0, scale: 0.85 }}
          animate={covered ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.9 }}
        >
          <OnboardingMark size="hero" />
        </motion.div>
      )}

      {/* Only the wordmark leaves with an exit animation — it blurs away as the mark flies on. */}
      <AnimatePresence>
        {phase === "intro" && (
          <OnboardingWordmark key="wordmark" instant={startedBefore} held={covered} />
        )}
      </AnimatePresence>

      {phase === "wizard" && (
        // Nothing here may animate opacity: this subtree contains the arriving mark, and dimming an
        // ancestor dims the shared element itself — which is what hid the flight. The card's
        // entrance lives on the glass layer BEHIND the content (see OnboardingLayout).
        <div className="flex w-full justify-center">
          <OnboardingLayout progress={progress}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                // The first step mounts at rest so the mark can fly in undimmed; only later step
                // swaps get an entrance.
                initial={step === 0 ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.22 } }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              >
                {current === "name" && <NameStep onContinue={next} />}
                {current === "cards" && <CardsStep onContinue={next} />}
                {current === "deposit" && <DepositStep onContinue={next} />}
                {current === "salary" && <SalaryStep onContinue={next} />}
                {current === "expense" && <ExpenseStep onContinue={next} />}
              </motion.div>
            </AnimatePresence>
          </OnboardingLayout>
        </div>
      )}
    </OnboardingScene>
  );
}
