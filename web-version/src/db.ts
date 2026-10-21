import Dexie, { type EntityTable } from 'dexie';
import type { Tx } from './money';
import { makeBackup, type Backup, type Photo } from './backup';

// Photos live in their own table so loading the transaction list never pulls megabytes of images into memory.
export const db = new Dexie('buku-kas-ibuk') as Dexie & {
  tx: EntityTable<Tx, 'id'>;
  photos: EntityTable<Photo, 'id'>;
};

db.version(1).stores({
  tx: '++id, book, date',
  photos: 'id',
});

// Ask the browser not to evict our data when the phone is low on space; this is the only copy.
navigator.storage?.persist?.().catch(() => {});

/** Save a new or edited transaction. photo: string = set, null = remove, undefined = keep as is. */
export async function saveTx(t: Tx, photo: string | null | undefined): Promise<void> {
  await db.transaction('rw', db.tx, db.photos, async () => {
    const hasPhoto = photo === undefined ? t.hasPhoto : photo !== null;
    const id = await db.tx.put({ ...t, hasPhoto });
    if (photo) await db.photos.put({ id, dataUrl: photo });
    else if (photo === null && t.id !== undefined) await db.photos.delete(t.id);
  });
}

export async function deleteTx(id: number): Promise<void> {
  await db.transaction('rw', db.tx, db.photos, async () => {
    await db.tx.delete(id);
    await db.photos.delete(id);
  });
}

export async function exportAll(): Promise<Backup> {
  const [tx, photos] = await Promise.all([db.tx.toArray(), db.photos.toArray()]);
  return makeBackup(tx, photos);
}

/** Replace everything with a validated backup. One DB transaction: on any error nothing is lost. */
export async function replaceAll(b: Backup): Promise<void> {
  await db.transaction('rw', db.tx, db.photos, async () => {
    await db.tx.clear();
    await db.photos.clear();
    await db.tx.bulkAdd(b.transactions);
    await db.photos.bulkAdd(b.photos);
  });
}
