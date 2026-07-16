import type { Card, CardType } from "../../../domain/entities/Card";
import type { CardRepository } from "../../../domain/repositories/CardRepository";
import { Money } from "../../../domain/value-objects/Money";
import { STORES, idbBulkPut, idbCount, idbDelete, idbGetAll, idbPut } from "./db";

/** Persistence shape: creditLimit is stored as an exact decimal string. */
interface CardRecord {
  id: string;
  name: string;
  type: CardType;
  cutDay?: number;
  paymentDueDay?: number;
  color?: string;
  last4?: string;
  creditLimit?: string;
}

function toRecord(card: Card): CardRecord {
  return { ...card, creditLimit: card.creditLimit?.toStorage() };
}

function toEntity(record: CardRecord): Card {
  return {
    ...record,
    creditLimit: record.creditLimit != null ? Money.from(record.creditLimit) : undefined,
  };
}

export class CardRepositoryIndexedDb implements CardRepository {
  async add(card: Card): Promise<void> {
    await idbPut(STORES.cards, toRecord(card));
  }

  async getAll(): Promise<Card[]> {
    const records = await idbGetAll<CardRecord>(STORES.cards);
    return records.map(toEntity);
  }

  async update(card: Card): Promise<void> {
    await idbPut(STORES.cards, toRecord(card));
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.cards, id);
  }

  async ensureSeeded(defaults: Card[]): Promise<void> {
    const count = await idbCount(STORES.cards);
    if (count === 0) {
      await idbBulkPut(STORES.cards, defaults.map(toRecord));
    }
  }
}
