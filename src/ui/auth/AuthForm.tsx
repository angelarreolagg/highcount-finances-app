import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "./authContext";
import { Button } from "../components/shared/Button";
import { Field } from "../components/shared/Field";
import { control } from "../components/shared/formStyles";

interface FormValues {
  email: string;
  password: string;
}

/**
 * Shared Google + email/password auth form (used by the /login page and the in-app SignInModal).
 * On a successful password sign-in it calls `onSignedIn` (e.g. to close the modal); the page
 * relies on AuthProvider to navigate after the session changes. Sign-up shows the confirm-email
 * notice; Google triggers the OAuth redirect.
 */
export function AuthForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
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
        onSignedIn?.();
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
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void google()}
        aria-label={t("auth.google")}
        className="mx-auto block rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-peri/40"
      >
        <img src="/google/google-signin.png" alt="" className="h-11 w-auto" />
      </button>

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
  );
}
