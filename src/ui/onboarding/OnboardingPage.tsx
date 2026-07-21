import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useSettingsStore } from "../../state/settingsStore";
import { useAuth } from "../auth/authContext";
import { OnboardingLayout } from "./OnboardingLayout";
import { CardsStep } from "./steps/CardsStep";
import { ExpenseStep } from "./steps/ExpenseStep";
import { SignUpStep } from "./steps/SignUpStep";
import { WelcomeStep } from "./steps/WelcomeStep";

/** First-run wizard: welcome → cards → first expense → optional sign-up → dashboard. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const { isCloudEnabled } = useAuth();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);

  const steps = isCloudEnabled
    ? (["welcome", "cards", "expense", "signup"] as const)
    : (["welcome", "cards", "expense"] as const);
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
          {current === "signup" && <SignUpStep onFinish={finish} />}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
