/** Minimal promise wrapper over native IndexedDB (no external library). */

const DB_NAME = "highcount";
const DB_VERSION = 1;

export const STORES = {
  transactions: "transactions",
  cards: "cards",
  categories: "categories",
  savings: "savings",
  msiPlans: "msiPlans",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return requestToPromise(tx.objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function idbPut(store: StoreName, value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await transactionDone(tx);
}

/** Write several records atomically in a single transaction. */
export async function idbBulkPut(store: StoreName, values: unknown[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  for (const value of values) {
    tx.objectStore(store).put(value);
  }
  await transactionDone(tx);
}

export async function idbDelete(store: StoreName, key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(key);
  await transactionDone(tx);
}

/** Delete several records atomically in a single transaction. */
export async function idbBulkDelete(store: StoreName, keys: string[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  for (const key of keys) {
    tx.objectStore(store).delete(key);
  }
  await transactionDone(tx);
}

export async function idbCount(store: StoreName): Promise<number> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return requestToPromise(tx.objectStore(store).count());
}
