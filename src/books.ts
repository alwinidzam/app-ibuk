import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book, BookId, Category, TxType } from './types';

const saldoAwal: Category = { name: 'Saldo awal' };
const lainnya: Category = { name: 'Lainnya' };

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'sekolah',
    short: 'Sekolah',
    name: 'Kas Sekolah',
    icon: 'school',
    accentColor: '#0A84FF',
    accentBg: '#F8FAFC',
    categories: {
      in: [
        saldoAwal,
        { name: 'Iuran siswa' },
        { name: 'Dana sekolah' },
        { name: 'Sumbangan' },
        lainnya,
      ],
      out: [
        { name: 'ATK & fotokopi' },
        { name: 'Konsumsi' },
        { name: 'Kegiatan' },
        { name: 'Perbaikan' },
        { name: 'Transport' },
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
    accentBg: '#FAF7FB',
    categories: {
      in: [
        saldoAwal,
        { name: 'Iuran bulanan' },
        { name: 'Setoran arisan' },
        { name: 'Sumbangan' },
        lainnya,
      ],
      out: [
        { name: 'Konsumsi' },
        { name: 'Dana sosial' },
        { name: 'Arisan keluar' },
        { name: 'Kegiatan' },
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
    accentBg: '#F6FAF7',
    categories: {
      in: [
        saldoAwal,
        { name: 'Uang bulanan' },
        { name: 'Kiriman' },
        { name: 'Jualan' },
        lainnya,
      ],
      out: [
        { name: 'Belanja dapur' },
        { name: 'Listrik & air' },
        { name: 'Gas & beras' },
        { name: 'Sekolah anak' },
        { name: 'Pulsa' },
        { name: 'Kesehatan' },
        lainnya,
      ],
    },
  },
];

const STORAGE_KEY = '@buku_kas_custom_books_v1';

export let BOOKS: Book[] = DEFAULT_BOOKS;

export async function loadStoredBooks(): Promise<Book[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        BOOKS = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load books from storage', err);
  }
  BOOKS = DEFAULT_BOOKS;
  return DEFAULT_BOOKS;
}

export async function saveStoredBooks(books: Book[]): Promise<void> {
  BOOKS = books;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save books to storage', err);
  }
}

export function bookById(id: BookId, books: Book[] = BOOKS): Book {
  return books.find((b) => b.id === id) || books[0] || DEFAULT_BOOKS[0];
}

export function defaultCategoriesForNewBook(): Record<TxType, Category[]> {
  return {
    in: [
      saldoAwal,
      { name: 'Iuran / Setoran' },
      { name: 'Sumbangan / Donasi' },
      lainnya,
    ],
    out: [
      { name: 'Operasional' },
      { name: 'Konsumsi' },
      { name: 'Kegiatan' },
      lainnya,
    ],
  };
}
