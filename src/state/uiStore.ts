import { create } from "zustand";

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

interface UiState {
  detailMonth: MonthSelection | null;
  activeModal: ModalKind | null;
  openMonthDetail: (selection: MonthSelection) => void;
  closeMonthDetail: () => void;
  openModal: (kind: ModalKind) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  detailMonth: null,
  activeModal: null,
  openMonthDetail: (selection) => set({ detailMonth: selection }),
  closeMonthDetail: () => set({ detailMonth: null }),
  openModal: (kind) => set({ activeModal: kind }),
  closeModal: () => set({ activeModal: null }),
}));
