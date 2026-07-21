import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../../state/uiStore";
import { AuthForm } from "../../auth/AuthForm";
import { Modal } from "../shared/Modal";

/** In-app sign-in (from the profile menu). Wraps the shared AuthForm in a glass modal. */
export function SignInModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.activeModal === "signIn");
  const closeModal = useUiStore((s) => s.closeModal);
  // Remount the form on each open so its internal state (mode/errors) resets.
  const [instance, setInstance] = useState(0);

  const close = () => {
    closeModal();
    setInstance((n) => n + 1);
  };

  return (
    <Modal open={open} title={t("auth.titleSignIn")} onClose={close}>
      <AuthForm key={instance} onSignedIn={close} />
    </Modal>
  );
}
