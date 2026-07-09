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

interface UiState {
  detailMonth: MonthSelection | null;
  openMonthDetail: (selection: MonthSelection) => void;
  closeMonthDetail: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  detailMonth: null,
  openMonthDetail: (selection) => set({ detailMonth: selection }),
  closeMonthDetail: () => set({ detailMonth: null }),
}));
