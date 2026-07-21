import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { OnboardingLayout } from "./OnboardingLayout";
import { CardsStep } from "./steps/CardsStep";
import { ExpenseStep } from "./steps/ExpenseStep";
import { WelcomeStep } from "./steps/WelcomeStep";

/**
 * Local setup wizard: welcome → cards → first expense → dashboard. Reached from /login's
 * "continue without an account". Auth lives up front on /login, so there's no sign-up step here.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);

  const steps = ["welcome", "cards", "expense"] as const;
  const current = steps[Math.min(step, steps.length - 1)];

  const finish = () => {
    setOnboardingComplete(true);
    navigate("/");
  };
  const next = () => {
    if (step >= steps.length - 1) finish();
    else setStep((s) => s + 1);
  };

  // Welcome (step 0) shows no dots; the rest map onto a 1-based progress track.
  const progress = step === 0 ? undefined : { current: step, total: steps.length - 1 };

  return (
    <OnboardingLayout progress={progress}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
        >
          {current === "welcome" && <WelcomeStep onContinue={next} />}
          {current === "cards" && <CardsStep onContinue={next} />}
          {current === "expense" && <ExpenseStep onContinue={next} />}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
