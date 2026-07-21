import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../../state/uiStore";
import { useAuth } from "../../auth/authContext";
import { Button } from "../shared/Button";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

interface FormValues {
  email: string;
  password: string;
}

/** Google + email/password auth. Backend switches automatically once the session changes. */
export function SignInModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.activeModal === "signIn");
  const closeModal = useUiStore((s) => s.closeModal);
  const { signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const close = () => {
    closeModal();
    reset();
    setMode("signIn");
    setError(null);
    setNotice(null);
  };

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signIn") {
        await signInWithPassword(email, password);
        close();
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
    <Modal
      open={open}
      title={t(mode === "signIn" ? "auth.titleSignIn" : "auth.titleSignUp")}
      onClose={close}
    >
      <div className="space-y-3">
        <Button type="button" onClick={google} className="w-full">
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
    </Modal>
  );
}
