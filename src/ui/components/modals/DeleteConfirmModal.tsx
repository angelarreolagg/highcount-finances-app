import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../../state/uiStore";
import type { DeleteTarget } from "../../../state/uiStore";
import {
  useCardUsage,
  useRemoveCard,
  useRemoveMSIPlan,
  useRemoveSavingsEntry,
  useRemoveTransaction,
} from "../../hooks/useDashboardData";
import { seedLabel } from "../../i18n/labels";
import { Button } from "../shared/Button";
import { Modal } from "../shared/Modal";

function targetName(target: DeleteTarget, t: TFunction): string {
  switch (target.type) {
    case "transaction":
    case "savings":
      return target.label;
    case "card":
      return seedLabel(t, target.card.id, target.card.name);
    case "msiPlan":
      return target.plan.description;
  }
}

/** Intermediate confirmation for every destructive action. */
export function DeleteConfirmModal() {
  const { t } = useTranslation();
  const target = useUiStore((s) => s.deleteTarget);
  const closeDelete = useUiStore((s) => s.closeDelete);

  const removeTransaction = useRemoveTransaction();
  const removeCard = useRemoveCard();
  const removeMSIPlan = useRemoveMSIPlan();
  const removeSavingsEntry = useRemoveSavingsEntry();

  const cardId = target?.type === "card" ? target.card.id : null;
  const { data: usage } = useCardUsage(cardId);
  const cardInUse =
    target?.type === "card" && usage != null && (usage.transactionCount > 0 || usage.planCount > 0);

  const mutation =
    target?.type === "transaction"
      ? removeTransaction
      : target?.type === "card"
        ? removeCard
        : target?.type === "msiPlan"
          ? removeMSIPlan
          : removeSavingsEntry;

  const onConfirm = () => {
    if (!target) return;
    const id =
      target.type === "card"
        ? target.card.id
        : target.type === "msiPlan"
          ? target.plan.id
          : target.id;
    mutation.mutate(id, { onSuccess: closeDelete });
  };

  return (
    <Modal
      open={target !== null}
      title={target ? t("modals.delete.title", { name: targetName(target, t) }) : ""}
      onClose={closeDelete}
    >
      {target && (
        <div className="space-y-4">
          {target.type === "transaction" && (
            <p className="text-sm text-white/60">{t("modals.delete.transaction")}</p>
          )}
          {target.type === "savings" && (
            <p className="text-sm text-white/60">{t("modals.delete.savings")}</p>
          )}
          {target.type === "msiPlan" && (
            <p className="text-sm text-white/60">
              {t("modals.delete.msiPlan", { count: target.plan.months })}
            </p>
          )}
          {target.type === "card" &&
            (cardInUse ? (
              <p className="text-sm text-coral">
                {t("modals.delete.cardTransactions", { count: usage.transactionCount })}
                {usage.planCount > 0 &&
                  t("modals.delete.cardPlans", { count: usage.planCount })}
                {t("modals.delete.cardInUseSuffix")}
              </p>
            ) : (
              <p className="text-sm text-white/60">{t("modals.delete.cardNotInUse")}</p>
            ))}

          <div className="flex gap-2">
            <Button
              variant="danger"
              className="flex-1"
              disabled={mutation.isPending || cardInUse}
              onClick={onConfirm}
            >
              {mutation.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
            <Button type="button" onClick={closeDelete}>
              {t("common.cancel")}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-xs text-coral">{(mutation.error as Error).message}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
