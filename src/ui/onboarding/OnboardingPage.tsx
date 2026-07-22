import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { OnboardingLayout } from "./OnboardingLayout";
import { CardsStep } from "./steps/CardsStep";
import { DepositStep } from "./steps/DepositStep";
import { ExpenseStep } from "./steps/ExpenseStep";
import { NameStep } from "./steps/NameStep";

/**
 * Setup wizard: your name → cards → initial deposit → first expense → dashboard. Reached from
 * /login's "continue without an account" and for new signed-in accounts with no data.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);

  const steps = ["name", "cards", "deposit", "expense"] as const;
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
          {current === "name" && <NameStep onContinue={next} />}
          {current === "cards" && <CardsStep onContinue={next} />}
          {current === "deposit" && <DepositStep onContinue={next} />}
          {current === "expense" && <ExpenseStep onContinue={next} />}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
