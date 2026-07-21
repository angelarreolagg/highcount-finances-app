import type { Card } from "../../../domain/entities/Card";
import type { CardRepository } from "../../../domain/repositories/CardRepository";
import type { CardRecord } from "../records";
import { cardFromRecord as toEntity, cardToRecord as toRecord } from "../records";
import { STORES, idbBulkPut, idbCount, idbDelete, idbGetAll, idbPut } from "./db";

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
