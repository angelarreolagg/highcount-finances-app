import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/authContext";
import { Button } from "../../components/shared/Button";
import { Field } from "../../components/shared/Field";
import { control } from "../../components/shared/formStyles";
import { OnboardingSkip } from "../OnboardingLayout";

interface FormValues {
  email: string;
  password: string;
}

export function SignUpStep({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signIn") {
        await signInWithPassword(email, password);
        onFinish();
      } else {
        await signUpWithPassword(email, password);
        setNotice(t("auth.checkEmail"));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  });

  const google = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t("onboarding.signUpTitle")}</h1>
      <p className="mt-1 text-sm text-white/60">{t("onboarding.signUpBody")}</p>

      <div className="mt-4 space-y-3">
        <Button type="button" onClick={() => void google()} className="w-full">
          {t("auth.google")}
        </Button>
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="h-px flex-1 bg-white/10" />
          {t("auth.orEmail")}
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label={t("auth.email")} error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              {...register("email", { required: t("auth.emailRequired") })}
              placeholder={t("auth.emailPlaceholder")}
              className={control}
            />
          </Field>
          <Field label={t("auth.password")} error={errors.password?.message}>
            <input
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              {...register("password", {
                required: t("auth.passwordRequired"),
                minLength: { value: 6, message: t("auth.passwordMin") },
              })}
              placeholder={t("auth.passwordPlaceholder")}
              className={control}
            />
          </Field>
          <Button type="submit" variant="primary" disabled={pending} className="w-full">
            {pending
              ? t("common.saving")
              : t(mode === "signIn" ? "auth.submitSignIn" : "auth.submitSignUp")}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
            setError(null);
            setNotice(null);
          }}
          className="w-full text-center text-xs text-peri hover:underline"
        >
          {t(mode === "signIn" ? "auth.toSignUp" : "auth.toSignIn")}
        </button>
        {notice && <p className="text-xs text-mint">{notice}</p>}
        {error && <p className="text-xs text-coral">{error}</p>}
      </div>

      <div className="mt-5">
        <OnboardingSkip onClick={onFinish}>{t("onboarding.maybeLater")}</OnboardingSkip>
      </div>
    </div>
  );
}
