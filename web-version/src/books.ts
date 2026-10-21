import type { BookId, TxType } from './money';

export interface Category {
  name: string;
  emoji: string;
}

export interface Book {
  id: BookId;
  short: string; // segmented control label, e.g. "Sekolah", "Ibu-Ibu", "Masjid"
  name: string; // full display name, e.g. "Kas Sekolah", "Kas Ibu-Ibu"
  icon?: string; // identifier for SVG icon: 'school' | 'mother' | 'home' | 'building' | 'store' | 'heart'
  accentColor?: string; // hex color e.g. '#0A84FF', '#AF52DE', '#34C759', '#F59E0B'
  categories: Record<TxType, Category[]>;
}

const saldoAwal: Category = { name: 'Saldo awal', emoji: '💰' };
const lainnya: Category = { name: 'Lainnya', emoji: '📝' };

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'sekolah',
    short: 'Sekolah',
    name: 'Kas Sekolah',
    icon: 'school',
    accentColor: '#0A84FF',
    categories: {
      in: [
        saldoAwal,
        { name: 'Iuran siswa', emoji: '🎒' },
        { name: 'Dana sekolah', emoji: '🏫' },
        { name: 'Sumbangan', emoji: '🤝' },
        lainnya,
      ],
      out: [
        { name: 'ATK & fotokopi', emoji: '✏️' },
        { name: 'Konsumsi', emoji: '🍱' },
        { name: 'Kegiatan', emoji: '🎉' },
        { name: 'Perbaikan', emoji: '🛠️' },
        { name: 'Transport', emoji: '🚌' },
        lainnya,
      ],
    },
  },
  {
    id: 'ibu',
    short: 'Ibu-Ibu',
    name: 'Kas Ibu-Ibu',
    icon: 'mother',
    accentColor: '#AF52DE',
    categories: {
      in: [
        saldoAwal,
        { name: 'Iuran bulanan', emoji: '💵' },
        { name: 'Setoran arisan', emoji: '🎲' },
        { name: 'Sumbangan', emoji: '🤝' },
        lainnya,
      ],
      out: [
        { name: 'Konsumsi', emoji: '🍵' },
        { name: 'Dana sosial', emoji: '💐' },
        { name: 'Arisan keluar', emoji: '🎁' },
        { name: 'Kegiatan', emoji: '🎉' },
        lainnya,
      ],
    },
  },
  {
    id: 'rumah',
    short: 'Rumah',
    name: 'Kas Rumah',
    icon: 'home',
    accentColor: '#34C759',
    categories: {
      in: [
        saldoAwal,
        { name: 'Uang bulanan', emoji: '💼' },
        { name: 'Kiriman', emoji: '💌' },
        { name: 'Jualan', emoji: '🛍️' },
        lainnya,
      ],
      out: [
        { name: 'Belanja dapur', emoji: '🥬' },
        { name: 'Listrik & air', emoji: '💡' },
        { name: 'Gas & beras', emoji: '🍚' },
        { name: 'Sekolah anak', emoji: '📚' },
        { name: 'Pulsa', emoji: '📱' },
        { name: 'Kesehatan', emoji: '💊' },
        lainnya,
      ],
    },
  },
];

const STORAGE_KEY = 'buku-kas-custom-books-v1';

/** Load books from localStorage or return default books */
export function loadStoredBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BOOKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_BOOKS;
}

/** Save custom books to localStorage */
export function saveStoredBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save books:', err);
  }
}

// Global cached books for backward compatibility
export let BOOKS: Book[] = loadStoredBooks();

export function setBooksCache(books: Book[]): void {
  BOOKS = books;
  saveStoredBooks(books);
}

export function bookById(id: BookId, books: Book[] = BOOKS): Book {
  return books.find((b) => b.id === id) || books[0] || DEFAULT_BOOKS[0];
}

/** Create standard template categories for a newly added book */
export function defaultCategoriesForNewBook(): Record<TxType, Category[]> {
  return {
    in: [
      saldoAwal,
      { name: 'Iuran / Setoran', emoji: '💵' },
      { name: 'Sumbangan / Donasi', emoji: '🤝' },
      lainnya,
    ],
    out: [
      { name: 'Operasional', emoji: '💼' },
      { name: 'Konsumsi', emoji: '🍱' },
      { name: 'Kegiatan', emoji: '🎉' },
      lainnya,
    ],
  };
}

/** Emoji for a stored category name; old/unknown names fall back to 📝. */
export function emojiFor(book: Book, type: TxType, name: string): string {
  return book.categories[type]?.find((c) => c.name === name)?.emoji ?? lainnya.emoji;
}
