import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { OnboardingIntro, OnboardingLayout } from "./OnboardingLayout";
import { CardsStep } from "./steps/CardsStep";
import { DepositStep } from "./steps/DepositStep";
import { ExpenseStep } from "./steps/ExpenseStep";
import { NameStep } from "./steps/NameStep";
import { SalaryStep } from "./steps/SalaryStep";

/**
 * Setup wizard: your name → cards → initial deposit → first expense → dashboard. Reached from
 * /login's "continue without an account" and for new signed-in accounts with no data.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);
  // A deliberate brand-intro beat before the wizard, so both entry paths (Google OAuth return and
  // "continue local") present the app cleanly instead of snapping to the first step.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(id);
  }, []);

  const steps = ["name", "cards", "deposit", "salary", "expense"] as const;
  const current = steps[Math.min(step, steps.length - 1)];

  const finish = () => {
    setOnboardingComplete(true);
    navigate("/");
  };
  const next = () => {
    if (step >= steps.length - 1) finish();
    else setStep((s) => s + 1);
  };

  const progress = { current: step + 1, total: steps.length };

  // Crossfade from the brand intro into the wizard once the intro beat has played.
  return (
    <AnimatePresence mode="wait">
      {!ready ? (
        <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <OnboardingIntro />
        </motion.div>
      ) : (
        <motion.div
          key="wizard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <OnboardingLayout progress={progress}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              >
                {current === "name" && <NameStep onContinue={next} />}
                {current === "cards" && <CardsStep onContinue={next} />}
                {current === "deposit" && <DepositStep onContinue={next} />}
                {current === "salary" && <SalaryStep onContinue={next} />}
                {current === "expense" && <ExpenseStep onContinue={next} />}
              </motion.div>
            </AnimatePresence>
          </OnboardingLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
