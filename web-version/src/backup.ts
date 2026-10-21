// Backup file format + validation. Restoring a file is a trust boundary: never write unchecked data to the DB.
import type { Tx, TxType } from './money.ts';

export interface Photo { id: number; dataUrl: string }

export interface Backup {
  app: 'buku-kas-ibuk';
  version: 1;
  exportedAt: string;
  books?: any[];
  transactions: Tx[];
  photos: Photo[];
}

const DEFAULT_BOOK_IDS = ['sekolah', 'ibu', 'rumah'];
const TYPES: TxType[] = ['in', 'out'];

const bad = (why: string): never => {
  throw new Error(`File cadangan rusak atau bukan dari aplikasi ini (${why}).`);
};

const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;
const isPosInt = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) > 0;

export function makeBackup(transactions: Tx[], photos: Photo[], now = new Date(), books?: any[]): Backup {
  return {
    app: 'buku-kas-ibuk',
    version: 1,
    exportedAt: now.toISOString(),
    books,
    transactions,
    photos,
  };
}

export function parseBackup(text: string): Backup {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return bad('bukan JSON');
  }
  if (data?.app !== 'buku-kas-ibuk' || data.version !== 1) bad('penanda aplikasi');
  if (!Array.isArray(data.transactions) || !Array.isArray(data.photos)) bad('isi data');

  const allowedBooks = new Set<string>([
    ...DEFAULT_BOOK_IDS,
    ...(Array.isArray(data.books) ? data.books.map((b: any) => b?.id).filter(Boolean) : []),
  ]);

  const ids = new Set<number>();
  const transactions: Tx[] = data.transactions.map((t: any, i: number): Tx => {
    const ok =
      isPosInt(t?.id) && !ids.has(t.id) &&
      typeof t?.book === 'string' && allowedBooks.has(t.book) &&
      TYPES.includes(t.type) &&
      isPosInt(t.amount) &&
      isStr(t.category, 60) &&
      isStr(t.note, 500) &&
      typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
      typeof t.hasPhoto === 'boolean' &&
      Number.isFinite(t.createdAt);
    if (!ok) bad(`catatan ke-${i + 1}`);
    ids.add(t.id);
    // Copy only known fields so nothing unexpected reaches the DB.
    return {
      id: t.id, book: t.book, type: t.type, amount: t.amount, category: t.category,
      note: t.note, date: t.date, hasPhoto: t.hasPhoto, createdAt: t.createdAt,
    };
  });

  const photos: Photo[] = data.photos.map((p: any, i: number): Photo => {
    const ok =
      isPosInt(p?.id) && ids.has(p.id) &&
      isStr(p.dataUrl, 10_000_000) &&
      /^data:image\/(jpeg|png|webp);base64,/i.test(p.dataUrl);
    if (!ok) bad(`foto ke-${i + 1}`);
    return { id: p.id, dataUrl: p.dataUrl };
  });

  return {
    app: 'buku-kas-ibuk',
    version: 1,
    exportedAt: data.exportedAt || new Date().toISOString(),
    books: Array.isArray(data.books) ? data.books : undefined,
    transactions,
    photos,
  };
}
