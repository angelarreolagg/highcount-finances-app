import { useUiStore } from "../../../state/uiStore";
import type { DeleteTarget } from "../../../state/uiStore";
import {
  useCardUsage,
  useRemoveCard,
  useRemoveMSIPlan,
  useRemoveSavingsEntry,
  useRemoveTransaction,
} from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { Modal } from "../shared/Modal";

function targetName(target: DeleteTarget): string {
  switch (target.type) {
    case "transaction":
    case "savings":
      return target.label;
    case "card":
      return target.card.name;
    case "msiPlan":
      return target.plan.description;
  }
}

/** Intermediate confirmation for every destructive action. */
export function DeleteConfirmModal() {
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
    <Modal open={target !== null} title={target ? `Delete "${targetName(target)}"?` : ""} onClose={closeDelete}>
      {target && (
        <div className="space-y-4">
          {target.type === "transaction" && (
            <p className="text-sm text-white/60">
              This removes the movement from its month and every total. This can't be undone.
            </p>
          )}
          {target.type === "savings" && (
            <p className="text-sm text-white/60">
              This removes the movement and recalculates your savings balance. This can't be
              undone.
            </p>
          )}
          {target.type === "msiPlan" && (
            <p className="text-sm text-white/60">
              This also deletes the plan's {target.plan.months} installment transaction
              {target.plan.months === 1 ? "" : "s"}. This can't be undone.
            </p>
          )}
          {target.type === "card" &&
            (cardInUse ? (
              <p className="text-sm text-coral">
                This card still has {usage.transactionCount} transaction
                {usage.transactionCount === 1 ? "" : "s"}
                {usage.planCount > 0 &&
                  ` and ${usage.planCount} MSI plan${usage.planCount === 1 ? "" : "s"}`}
                . Delete or move them first — deleting the card would orphan your history.
              </p>
            ) : (
              <p className="text-sm text-white/60">
                The card/account will be removed. This can't be undone.
              </p>
            ))}

          <div className="flex gap-2">
            <Button
              variant="danger"
              className="flex-1"
              disabled={mutation.isPending || cardInUse}
              onClick={onConfirm}
            >
              {mutation.isPending ? "Deleting…" : "Delete"}
            </Button>
            <Button type="button" onClick={closeDelete}>
              Cancel
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
