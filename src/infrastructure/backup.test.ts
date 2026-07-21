import { describe, expect, it } from "vitest";
import type { Card } from "../domain/entities/Card";
import type { Category } from "../domain/entities/Category";
import { DEFAULT_CATEGORIES } from "../domain/entities/Category";
import type { MSIPlan } from "../domain/entities/MSIPlan";
import type { SavingsEntry } from "../domain/entities/SavingsEntry";
import type { Transaction } from "../domain/entities/Transaction";
import { Money } from "../domain/value-objects/Money";
import { copyDataset, exportDataset } from "./backup";
import type { Repositories } from "./di/container";

/** Minimal in-memory repositories implementing the domain ports, for backup tests. */
function fakeRepositories(): Repositories {
  const cards = new Map<string, Card>();
  const categories = new Map<string, Category>();
  const savings = new Map<string, SavingsEntry>();
  const plans = new Map<string, MSIPlan>();
  const transactions = new Map<string, Transaction>();

  return {
    cardRepository: {
      add: async (c) => void cards.set(c.id, c),
      getAll: async () => [...cards.values()],
      update: async (c) => void cards.set(c.id, c),
      remove: async (id) => void cards.delete(id),
      ensureSeeded: async (defaults) => {
        if (cards.size === 0) for (const c of defaults) cards.set(c.id, c);
      },
    },
    categoryRepository: {
      getAll: async () => [...categories.values()],
      ensureSeeded: async (defaults) => {
        if (categories.size === 0) for (const c of defaults) categories.set(c.id, c);
      },
    },
    savingsRepository: {
      add: async (e) => void savings.set(e.id, e),
      getAll: async () => [...savings.values()].sort((a, b) => a.date.localeCompare(b.date)),
      update: async (e) => void savings.set(e.id, e),
      remove: async (id) => void savings.delete(id),
    },
    msiPlanRepository: {
      add: async (p) => void plans.set(p.id, p),
      getAll: async () => [...plans.values()].sort((a, b) => a.startDate.localeCompare(b.startDate)),
      update: async (p) => void plans.set(p.id, p),
      remove: async (id) => void plans.delete(id),
    },
    transactionRepository: {
      add: async (t) => void transactions.set(t.id, t),
      addMany: async (ts) => {
        for (const t of ts) transactions.set(t.id, t);
      },
      getAll: async () => [...transactions.values()],
      getByMonth: async () => [],
      getByYear: async () => [],
      update: async (t) => void transactions.set(t.id, t),
      remove: async (id) => void transactions.delete(id),
      removeMany: async (ids) => {
        for (const id of ids) transactions.delete(id);
      },
    },
  };
}

describe("backup export/import", () => {
  it("copyDataset moves the whole dataset losslessly", async () => {
    const from = fakeRepositories();
    await from.categoryRepository.ensureSeeded(DEFAULT_CATEGORIES);
    await from.cardRepository.add({
      id: "card-1",
      name: "BBVA",
      type: "credit",
      cutDay: 28,
      paymentDueDay: 17,
      color: "#818cf8",
      last4: "1234",
      creditLimit: Money.from("50000"),
    });
    await from.msiPlanRepository.add({
      id: "plan-1",
      cardId: "card-1",
      categoryId: "cat-shopping",
      description: "iPhone",
      totalAmount: Money.from("16000"),
      months: 12,
      monthlyAmount: Money.from("1333.34"),
      withInterest: false,
      startDate: "2026-07-10",
      color: "violet",
    });
    await from.savingsRepository.add({
      id: "s1",
      date: "2026-07-09",
      amount: Money.from("10600"),
      kind: "deposit",
    });
    await from.transactionRepository.addMany([
      {
        id: "t1",
        type: "expense",
        amount: Money.from("120"),
        categoryId: "cat-food",
        cardId: "card-1",
        date: "2026-07-09",
        description: "Taquitos",
      },
    ]);

    const to = fakeRepositories();
    await to.categoryRepository.ensureSeeded(DEFAULT_CATEGORIES);
    await copyDataset(from, to);

    const a = await exportDataset(from);
    const b = await exportDataset(to);
    // exportedAt is a timestamp; compare the data only.
    expect({ ...b, exportedAt: "" }).toEqual({ ...a, exportedAt: "" });
  });
});
