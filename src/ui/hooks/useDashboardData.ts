import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCases, repositories } from "../../infrastructure/di/container";
import type { AddTransactionInput } from "../../application/useCases/addTransaction";
import type { RegisterMSIPurchaseInput } from "../../application/useCases/registerMSIPurchase";
import type { LogSavingsGrowthInput } from "../../application/useCases/logSavingsGrowth";
import type { AddCardInput } from "../../application/useCases/manageCards";

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
