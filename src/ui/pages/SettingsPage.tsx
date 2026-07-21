import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageShell } from "../components/layout/PageShell";
import { GlassCard } from "../components/shared/GlassCard";
import { GlassSelect } from "../components/shared/GlassSelect";
import { Button } from "../components/shared/Button";
import { Field } from "../components/shared/Field";
import { control } from "../components/shared/formStyles";
import { useUiStore } from "../../state/uiStore";
import { useAuth } from "../auth/authContext";
import { useProfile } from "../hooks/useProfile";
import { repositories } from "../../infrastructure/di/container";
import { exportDataset, importDataset } from "../../infrastructure/backup";
import type { BackupDoc } from "../../infrastructure/backup";
import { DeleteAllModal } from "../components/modals/DeleteAllModal";

function isBackupDoc(value: unknown): value is BackupDoc {
  const d = value as Partial<BackupDoc> | null;
  return (
    !!d &&
    d.version === 1 &&
    Array.isArray(d.categories) &&
    Array.isArray(d.cards) &&
    Array.isArray(d.msiPlans) &&
    Array.isArray(d.savingsEntries) &&
    Array.isArray(d.transactions)
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { displayName, setDisplayName } = useProfile();
  const openModal = useUiStore((s) => s.openModal);
  const { isCloudEnabled, user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const language = i18n.resolvedLanguage ?? "en";
  const signedIn = isCloudEnabled && !!user;

  const saveName = async () => {
    const next = (nameInput.current?.value ?? "").trim();
    if (next !== displayName) {
      await setDisplayName(next);
      setNameSaved(true);
    }
  };

  const handleExport = async () => {
    setError(null);
    setNotice(null);
    const doc = await exportDataset(repositories);
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `highcount-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(href);
    setNotice(t("settings.exportDone"));
  };

  const handleImportFile = async (file: File) => {
    setError(null);
    setNotice(null);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupDoc(parsed)) {
        setError(t("settings.importInvalid"));
        return;
      }
      await importDataset(repositories, parsed);
      await queryClient.invalidateQueries();
      setNotice(t("settings.importDone"));
    } catch {
      setError(t("settings.importInvalid"));
    }
  };

  const modeText = !isCloudEnabled
    ? t("settings.cloudDisabled")
    : user
      ? t("settings.modeCloud", { email: user.email })
      : t("settings.modeLocal");

  return (
    <PageShell
      hero={
        <div className="pt-10 pb-6 text-center lg:pt-14">
          <p className="text-sm text-white/70">{t("settings.heroLabel")}</p>
          <h1 className="mt-2 text-4xl font-bold lg:text-5xl">{t("settings.title")}</h1>
        </div>
      }
    >
      <div className="mx-auto max-w-xl space-y-4 pt-2">
        <GlassCard title={t("settings.profile")}>
          <Field label={t("settings.displayName")}>
            {/* Uncontrolled + keyed so it re-seeds when the value loads (e.g. cloud fetch); saved
                only when the Save button is pressed. */}
            <input
              key={displayName}
              ref={nameInput}
              defaultValue={displayName}
              onChange={() => setNameSaved(false)}
              placeholder={t("settings.displayNamePlaceholder")}
              autoComplete="off"
              className={control}
            />
          </Field>
          <p className="mt-2 text-xs text-white/40">{t("settings.displayNameHint")}</p>
          <div className="mt-3 flex items-center gap-3">
            <Button variant="primary" onClick={() => void saveName()}>
              {t("common.save")}
            </Button>
            {nameSaved && <span className="text-xs text-mint">{t("settings.saved")}</span>}
          </div>
        </GlassCard>

        <GlassCard title={t("settings.preferences")}>
          <Field label={t("settings.language")}>
            <GlassSelect
              value={language}
              onChange={(v) => void i18n.changeLanguage(v)}
              aria-label={t("settings.language")}
              placeholder={t("settings.language")}
              options={[
                { value: "en", label: t("settings.english") },
                { value: "es", label: t("settings.spanish") },
              ]}
            />
          </Field>
        </GlassCard>

        <GlassCard title={t("settings.account")}>
          <p className="text-sm text-white/60">{modeText}</p>
          {isCloudEnabled && (
            <div className="mt-3">
              {user ? (
                <Button type="button" onClick={() => void signOut()}>
                  {t("auth.signOut")}
                </Button>
              ) : (
                <Button type="button" variant="primary" onClick={() => openModal("signIn")}>
                  {t("auth.signIn")}
                </Button>
              )}
            </div>
          )}

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-sm font-medium">{t("settings.backup")}</p>
            <p className="mt-1 text-xs text-white/40">{t("settings.backupHint")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleExport()}>
                {t("settings.exportBackup")}
              </Button>
              <Button type="button" onClick={() => fileInput.current?.click()}>
                {t("settings.importBackup")}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImportFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            {notice && <p className="mt-2 text-xs text-mint">{notice}</p>}
            {error && <p className="mt-2 text-xs text-coral">{error}</p>}
          </div>
        </GlassCard>

        <GlassCard title={t("settings.about")}>
          <p className="text-sm text-white/60">{t("settings.aboutText")}</p>
        </GlassCard>

        <GlassCard title={t("settings.dangerZone")} className="ring-1 ring-coral/25">
          <p className="text-sm text-coral/90">{t("settings.deleteAllHint")}</p>
          <p className="mt-1 text-xs text-white/50">
            {signedIn
              ? t("settings.deleteScopeCloud", { email: user?.email })
              : t("settings.deleteScopeLocal")}
          </p>
          <div className="mt-3">
            <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
              {t("settings.deleteEverything")}
            </Button>
          </div>
        </GlassCard>
      </div>

      <DeleteAllModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </PageShell>
  );
}
