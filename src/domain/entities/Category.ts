export type CategoryKind = "expense" | "income";

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food", kind: "expense" },
  { id: "cat-transport", name: "Transport", kind: "expense" },
  { id: "cat-housing", name: "Housing", kind: "expense" },
  { id: "cat-services", name: "Services", kind: "expense" },
  { id: "cat-health", name: "Health", kind: "expense" },
  { id: "cat-entertainment", name: "Entertainment", kind: "expense" },
  { id: "cat-shopping", name: "Shopping", kind: "expense" },
  { id: "cat-other-expense", name: "Other expense", kind: "expense" },
  { id: "cat-salary", name: "Salary", kind: "income" },
  { id: "cat-other-income", name: "Other income", kind: "income" },
];
