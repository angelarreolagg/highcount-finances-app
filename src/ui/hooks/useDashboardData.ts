import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCases, repositories } from "../../infrastructure/di/container";
import type { AddTransactionInput } from "../../application/useCases/addTransaction";
import type { RegisterMSIPurchaseInput } from "../../application/useCases/registerMSIPurchase";
import type { LogSavingsGrowthInput } from "../../application/useCases/logSavingsGrowth";
import type { AddCardInput, UpdateCardInput } from "../../application/useCases/manageCards";
import type { UpdateMSIPlanInput } from "../../application/useCases/updateMSIPlan";
import type { UpdateSavingsEntryInput } from "../../application/useCases/updateSavingsEntry";
import type { UpdateTransactionInput } from "../../application/useCases/updateTransaction";

/** Tanstack Query wraps the application use cases; the UI never touches repositories or IndexedDB directly. */

export function useDashboardSummary(year: number, monthIndex: number) {
  return useQuery({
    queryKey: ["dashboard", year, monthIndex],
    queryFn: () => useCases.getDashboardSummary(year, monthIndex),
  });
}

export function useMonthDetail(year: number | null, monthIndex: number | null) {
  return useQuery({
    queryKey: ["monthDetail", year, monthIndex],
    queryFn: () => useCases.getMonthDetail(year!, monthIndex!),
    enabled: year !== null && monthIndex !== null,
  });
}

export function useExpensesFeed() {
  return useQuery({
    queryKey: ["expensesFeed"],
    queryFn: () => useCases.getExpensesFeed(),
  });
}

export function useSavingsOverview() {
  return useQuery({
    queryKey: ["savingsOverview"],
    queryFn: () => useCases.getSavingsOverview(),
  });
}

export function useAnnualSummary(year: number) {
  return useQuery({
    queryKey: ["annualSummary", year],
    queryFn: () => useCases.getAnnualSummary(year),
  });
}

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => repositories.cardRepository.getAll(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => repositories.categoryRepository.getAll(),
  });
}

export function useSavingsEntries() {
  return useQuery({
    queryKey: ["savings"],
    queryFn: () => repositories.savingsRepository.getAll(),
  });
}

export function useMsiPlans() {
  return useQuery({
    queryKey: ["msiPlans"],
    queryFn: () => repositories.msiPlanRepository.getAll(),
  });
}

/** Local data is cheap to refetch; invalidate everything after any write. */
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}

export function useAddTransaction() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: AddTransactionInput) => useCases.addTransaction(input),
    onSuccess: invalidateAll,
  });
}

export function useRegisterMSIPurchase() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: RegisterMSIPurchaseInput) => useCases.registerMSIPurchase(input),
    onSuccess: invalidateAll,
  });
}

export function useLogSavingsGrowth() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: LogSavingsGrowthInput) => useCases.logSavingsGrowth(input),
    onSuccess: invalidateAll,
  });
}

export function useAddCard() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: AddCardInput) => useCases.addCard(input),
    onSuccess: invalidateAll,
  });
}

export function useUpdateTransaction() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => useCases.updateTransaction(input),
    onSuccess: invalidateAll,
  });
}

export function useRemoveTransaction() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => useCases.removeTransaction(id),
    onSuccess: invalidateAll,
  });
}

export function useUpdateCard() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: UpdateCardInput) => useCases.updateCard(input),
    onSuccess: invalidateAll,
  });
}

export function useRemoveCard() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => useCases.removeCard(id),
    onSuccess: invalidateAll,
  });
}

export function useUpdateMSIPlan() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: UpdateMSIPlanInput) => useCases.updateMSIPlan(input),
    onSuccess: invalidateAll,
  });
}

export function useRemoveMSIPlan() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => useCases.removeMSIPlan(id),
    onSuccess: invalidateAll,
  });
}

export function useUpdateSavingsEntry() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (input: UpdateSavingsEntryInput) => useCases.updateSavingsEntry(input),
    onSuccess: invalidateAll,
  });
}

export function useRemoveSavingsEntry() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => useCases.removeSavingsEntry(id),
    onSuccess: invalidateAll,
  });
}

/** How many transactions / MSI plans still reference a card (deletion is blocked while > 0). */
export function useCardUsage(cardId: string | null) {
  return useQuery({
    queryKey: ["cardUsage", cardId],
    enabled: cardId !== null,
    queryFn: async () => {
      const [transactions, plans] = await Promise.all([
        repositories.transactionRepository.getAll(),
        repositories.msiPlanRepository.getAll(),
      ]);
      return {
        transactionCount: transactions.filter((t) => t.cardId === cardId).length,
        planCount: plans.filter((p) => p.cardId === cardId).length,
      };
    },
  });
}
