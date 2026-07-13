import { create } from "zustand";
import type { Card } from "../domain/entities/Card";
import type { MSIPlan } from "../domain/entities/MSIPlan";
import type { SavingsTimelinePoint } from "../domain/services/savingsSummary";
import type { TransactionLineDTO } from "../application/dto/monthDetail";

/**
 * View-only state. All persisted data flows through Tanstack Query,
 * whose queryFns call application use cases — so this store stays thin
 * and swappable, per the architecture rules.
 */

interface MonthSelection {
  year: number;
  monthIndex: number;
}

export type ModalKind = "addTransaction" | "manageCards" | "registerMsi" | "logSavings";

/** Entity being edited — payloads are already-loaded query data, pure view state. */
export type EditTarget =
  | { type: "transaction"; transaction: TransactionLineDTO }
  | { type: "msiPlan"; plan: MSIPlan }
  | { type: "savings"; entry: SavingsTimelinePoint };

/** Entity awaiting delete confirmation. */
export type DeleteTarget =
  | { type: "transaction"; id: string; label: string }
  | { type: "card"; card: Card }
  | { type: "msiPlan"; plan: MSIPlan }
  | { type: "savings"; id: string; label: string };

interface UiState {
  detailMonth: MonthSelection | null;
  activeModal: ModalKind | null;
  editTarget: EditTarget | null;
  deleteTarget: DeleteTarget | null;
  openMonthDetail: (selection: MonthSelection) => void;
  closeMonthDetail: () => void;
  openModal: (kind: ModalKind) => void;
  closeModal: () => void;
  openEdit: (target: EditTarget) => void;
  closeEdit: () => void;
  openDelete: (target: DeleteTarget) => void;
  closeDelete: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  detailMonth: null,
  activeModal: null,
  editTarget: null,
  deleteTarget: null,
  openMonthDetail: (selection) => set({ detailMonth: selection }),
  closeMonthDetail: () => set({ detailMonth: null }),
  openModal: (kind) => set({ activeModal: kind }),
  closeModal: () => set({ activeModal: null }),
  openEdit: (target) => set({ editTarget: target }),
  closeEdit: () => set({ editTarget: null }),
  openDelete: (target) => set({ deleteTarget: target }),
  closeDelete: () => set({ deleteTarget: null }),
}));
