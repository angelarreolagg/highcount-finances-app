import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageShell } from "../components/layout/PageShell";
import { GlassCard } from "../components/shared/GlassCard";
import { GlassSelect } from "../components/shared/GlassSelect";
import { Button } from "../components/shared/Button";
import { Field } from "../components/shared/Field";
import { ThemePicker } from "../components/settings/ThemePicker";
import { LanguageFlag } from "../i18n/LanguageFlag";
import { control } from "../components/shared/formStyles";
import { useUiStore } from "../../state/uiStore";
import { useAuth } from "../auth/authContext";
import { useProfile } from "../hooks/useProfile";
import { repositories } from "../../infrastructure/di/container";
import { exportDataset, importDataset } from "../../infrastructure/backup";
import type { BackupDoc } from "../../infrastructure/backup";
import { DeleteAllModal } from "../components/modals/DeleteAllModal";
import { Money } from "../../domain/value-objects/Money";

/** Money format guard, shared with the entry modals: whole or 2-decimal amount. */
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

function isBackupDoc(value: unknown): value is BackupDoc {
  const d = value as Partial<BackupDoc> | null;
  // A stray `categories` array in older exports is ignored (importDataset never reads it).
  return (
    !!d &&
    d.version === 1 &&
    Array.isArray(d.cards) &&
    Array.isArray(d.msiPlans) &&
    Array.isArray(d.savingsEntries) &&
    Array.isArray(d.transactions)
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { displayName, setDisplayName, averageMonthlySalary, setAverageMonthlySalary } =
    useProfile();
  const openModal = useUiStore((s) => s.openModal);
  const { isCloudEnabled, user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const salaryInput = useRef<HTMLInputElement>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const language = i18n.resolvedLanguage ?? "en";
  const signedIn = isCloudEnabled && !!user;

  // Enable Save only when the name or salary field differs from its stored value.
  const recomputeDirty = () => {
    const nameVal = nameInput.current?.value ?? "";
    const salaryVal = salaryInput.current?.value ?? "";
    setProfileDirty(nameVal !== displayName || salaryVal !== averageMonthlySalary);
    setProfileSaved(false);
    setSalaryError(null);
  };

  const saveProfile = async () => {
    setSalaryError(null);
    const nameVal = (nameInput.current?.value ?? "").trim();
    const salaryRaw = (salaryInput.current?.value ?? "").trim();

    // Validate + normalize the salary only if it actually changed. null = leave as-is.
    let salaryToStore: string | null = null;
    if (salaryRaw !== averageMonthlySalary) {
      if (salaryRaw === "") {
        salaryToStore = ""; // clears the salary → runway "unknown"
      } else if (!AMOUNT_PATTERN.test(salaryRaw) || Number(salaryRaw) <= 0) {
        setSalaryError(t("validation.positiveAmount"));
        return;
      } else {
        salaryToStore = Money.from(salaryRaw).round2().toStorage();
      }
    }

    if (nameVal !== displayName) await setDisplayName(nameVal);
    if (salaryToStore !== null) await setAverageMonthlySalary(salaryToStore);
    setProfileSaved(true);
    setProfileDirty(false);
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
      <div className="mx-auto w-full max-w-xl pt-2 lg:max-w-5xl">
        {/* About sits at the very top — a titleless brand plaque. */}
        <GlassCard>
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <img
              src="/favicon/favicon-128x128.png"
              alt=""
              className="size-14 rounded-2xl shadow-lg shadow-black/30"
            />
            <div>
              <p className="text-base font-bold tracking-tight">High Count</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-white/60">
                {t("settings.aboutText")}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Profile + Preferences side by side, stretched to equal height (default grid stretch).
            Profile pins its account status + sign out to the bottom so it fills the taller column. */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GlassCard title={t("settings.profile")}>
            <div className="flex h-full flex-col">
              <Field label={t("settings.displayName")}>
                {/* Uncontrolled + keyed so it re-seeds when the value loads (e.g. cloud fetch);
                    saved only when the Save button is pressed. */}
                <input
                  key={displayName}
                  ref={nameInput}
                  defaultValue={displayName}
                  onChange={recomputeDirty}
                  placeholder={t("settings.displayNamePlaceholder")}
                  autoComplete="off"
                  className={control}
                />
              </Field>
              <p className="mt-2 text-xs text-white/40">{t("settings.displayNameHint")}</p>

              <div className="mt-4 border-t border-white/10 pt-4">
                <Field label={t("settings.averageSalary")} error={salaryError ?? undefined}>
                  <input
                    key={averageMonthlySalary}
                    ref={salaryInput}
                    defaultValue={averageMonthlySalary}
                    onChange={recomputeDirty}
                    inputMode="decimal"
                    placeholder={t("placeholders.amount")}
                    autoComplete="off"
                    className={control}
                  />
                </Field>
                <p className="mt-2 text-xs text-white/40">{t("settings.averageSalaryHint")}</p>
              </div>

              {/* One Save for the whole card — enabled only when something changed. */}
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="primary"
                  disabled={!profileDirty}
                  onClick={() => void saveProfile()}
                >
                  {t("common.save")}
                </Button>
                {profileSaved && <span className="text-xs text-mint">{t("settings.saved")}</span>}
              </div>

              {/* Account status + sign out pinned to the bottom to match the Preferences height. */}
              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-sm text-white/60">{modeText}</p>
                {isCloudEnabled && (
                  <div className="mt-3">
                    {user ? (
                      <Button type="button" variant="dangerSoft" onClick={() => void signOut()}>
                        {t("auth.signOut")}
                      </Button>
                    ) : (
                      <Button type="button" variant="primary" onClick={() => openModal("signIn")}>
                        {t("auth.signIn")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
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
                  {
                    value: "en",
                    label: t("settings.english"),
                    leading: <LanguageFlag lang="en" className="h-4 w-auto rounded-[2px]" />,
                  },
                  {
                    value: "es",
                    label: t("settings.spanish"),
                    leading: <LanguageFlag lang="es" className="h-4 w-auto rounded-[2px]" />,
                  },
                ]}
              />
            </Field>
            <div className="mt-4 border-t border-white/10 pt-4">
              <ThemePicker />
            </div>
          </GlassCard>
        </div>

        {/* Backup + danger zone — full width on desktop. */}
        <GlassCard title={t("settings.account")} className="mt-4">
          <div>
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

          <div className="mt-5 border-t border-coral/20 pt-4">
            <p className="text-sm font-medium text-coral">{t("settings.dangerZone")}</p>
            <p className="mt-1 text-xs text-coral/80">{t("settings.deleteAllHint")}</p>
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
          </div>
        </GlassCard>

      </div>

      <DeleteAllModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </PageShell>
  );
}
