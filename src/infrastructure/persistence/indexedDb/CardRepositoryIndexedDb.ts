import type { Card } from "../../../domain/entities/Card";
import type { CardRepository } from "../../../domain/repositories/CardRepository";
import { STORES, idbBulkPut, idbCount, idbDelete, idbGetAll, idbPut } from "./db";

export class CardRepositoryIndexedDb implements CardRepository {
  async add(card: Card): Promise<void> {
    await idbPut(STORES.cards, card);
  }

  async getAll(): Promise<Card[]> {
    return idbGetAll<Card>(STORES.cards);
  }

  async remove(id: string): Promise<void> {
    await idbDelete(STORES.cards, id);
  }

  async ensureSeeded(defaults: Card[]): Promise<void> {
    const count = await idbCount(STORES.cards);
    if (count === 0) {
      await idbBulkPut(STORES.cards, defaults);
    }
  }
}
