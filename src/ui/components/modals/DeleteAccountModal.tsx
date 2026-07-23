import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createIndexedDbRepositories } from "../../../infrastructure/di/container";
import { resetDataset } from "../../../infrastructure/reset";
import { supabase } from "../../../infrastructure/supabase/client";
import { deleteAccount } from "../../../infrastructure/persistence/supabase/repositories";
import { useSettingsStore } from "../../../state/settingsStore";
import { useAuth } from "../../auth/authContext";
import { Button } from "../shared/Button";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

/**
 * Type-to-confirm PERMANENT account deletion (signed-in only). Deletes the Supabase auth user
 * (cascading away all cloud data), then wipes the on-device copy and local preferences so a
 * later sign-in with the same method starts as a genuinely new account — no revived data.
 */
export function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { isCloudEnabled, user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [confirmWord, setConfirmWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedIn = isCloudEnabled && !!user && !!supabase;
  const canDelete = confirmWord.trim().toLowerCase() === t("settings.deleteKeyword").toLowerCase();

  const close = () => {
    onClose();
    setConfirmWord("");
    setError(null);
  };

  const handleDelete = async () => {
    if (!canDelete || deleting || !signedIn || !supabase) return;
    setDeleting(true);
    setError(null);
    try {
      // 1. Delete the cloud account (cascades all cloud rows) while the session is still valid.
      await deleteAccount(supabase);
      // 2. Wipe the on-device copy so nothing gets re-uploaded on a later fresh sign-in.
      await resetDataset(createIndexedDbRepositories());
      // 3. Reset local preferences (name/theme/salary/onboarding) → next account is truly new.
      useSettingsStore.getState().reset();
      // 4. Sign out — the server already invalidated the session, so tolerate a failure here.
      try {
        await signOut();
      } catch {
        // Session may already be gone after the account delete; ignore.
      }
      await queryClient.invalidateQueries();
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} title={t("settings.deleteAccountTitle")} onClose={close}>
      <div className="space-y-3">
        <p className="text-sm text-coral/90">{t("settings.deleteAccountHint")}</p>
        <p className="text-xs text-white/50">
          {t("settings.deleteAccountScope", { email: user?.email })}
        </p>

        <div>
          <label className="mb-1 block text-xs text-white/50">
            {t("settings.typeToConfirm", { word: t("settings.deleteKeyword") })}
          </label>
          <input
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            placeholder={t("settings.deleteKeyword")}
            autoComplete="off"
            autoFocus
            className={control}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            disabled={!canDelete || deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? t("settings.deletingAccount") : t("settings.deleteAccount")}
          </Button>
          <Button type="button" onClick={close}>
            {t("common.cancel")}
          </Button>
        </div>
        {error && <p className="text-xs text-coral">{error}</p>}
      </div>
    </Modal>
  );
}
