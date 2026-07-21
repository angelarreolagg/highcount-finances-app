import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createIndexedDbRepositories, repositories } from "../../../infrastructure/di/container";
import { resetDataset } from "../../../infrastructure/reset";
import { useAuth } from "../../auth/authContext";
import { Button } from "../shared/Button";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

/**
 * Type-to-confirm destructive reset. Wipes the ACTIVE backend (local when signed out,
 * the cloud account when signed in) and, optionally, the on-device local copy too.
 * Re-seeds the fresh-install defaults so the app stays usable.
 */
export function DeleteAllModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isCloudEnabled, user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmWord, setConfirmWord] = useState("");
  const [alsoLocal, setAlsoLocal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedIn = isCloudEnabled && !!user;
  const canDelete = confirmWord.trim().toLowerCase() === t("settings.deleteKeyword").toLowerCase();

  const close = () => {
    onClose();
    setConfirmWord("");
    setAlsoLocal(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await resetDataset(repositories); // the active backend
      if (signedIn && alsoLocal) {
        await resetDataset(createIndexedDbRepositories()); // also the on-device copy
      }
      await queryClient.invalidateQueries();
      close();
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} title={t("settings.deleteAllTitle")} onClose={close}>
      <div className="space-y-3">
        <p className="text-sm text-coral/90">{t("settings.deleteAllHint")}</p>
        <p className="text-xs text-white/50">
          {signedIn
            ? t("settings.deleteScopeCloud", { email: user?.email })
            : t("settings.deleteScopeLocal")}
        </p>

        {signedIn && (
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={alsoLocal}
              onChange={(e) => setAlsoLocal(e.target.checked)}
              className="size-4 accent-coral"
            />
            {t("settings.alsoWipeLocal")}
          </label>
        )}

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
            {deleting ? t("settings.deleting") : t("settings.deleteEverything")}
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
