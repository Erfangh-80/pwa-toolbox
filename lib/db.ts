import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/** Tag used when asking the service worker for a background sync. */
export const SYNC_TAG = "sync-messages";

/** Mock endpoint that accepts flushed items (see `app/api/sync/route.ts`). */
export const SYNC_ENDPOINT = "/api/sync";

export type PendingMessage = {
  id: number;
  text: string;
  createdAt: number;
};

interface ToolboxDB extends DBSchema {
  "pending-messages": {
    key: number;
    value: PendingMessage;
    indexes: { "by-created-at": number };
  };
}

const DB_NAME = "pwa-toolbox";
const DB_VERSION = 1;
const STORE = "pending-messages";

let dbPromise: Promise<IDBPDatabase<ToolboxDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<ToolboxDB>> => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this browser."));
  }

  dbPromise ??= openDB<ToolboxDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("by-created-at", "createdAt");
      }
    },
  });

  return dbPromise;
};

export const addPendingMessage = async (text: string): Promise<number> => {
  const db = await getDB();
  const value = { text, createdAt: Date.now() };
  return db.add(STORE, value as PendingMessage);
};

export const listPendingMessages = async (): Promise<PendingMessage[]> => {
  const db = await getDB();
  return db.getAllFromIndex(STORE, "by-created-at");
};

export const countPendingMessages = async (): Promise<number> => {
  const db = await getDB();
  return db.count(STORE);
};

export const deletePendingMessage = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE, id);
};

export const clearPendingMessages = async (): Promise<void> => {
  const db = await getDB();
  await db.clear(STORE);
};
