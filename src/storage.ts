import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BackupData, Tx } from './types';
import { todayISO } from './money';

const TX_KEY = '@buku_kas_ibuk_transactions_v1';

export async function loadTransactions(): Promise<Tx[]> {
  try {
    const raw = await AsyncStorage.getItem(TX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions', e);
    return [];
  }
}

export async function saveTransaction(tx: Tx): Promise<Tx[]> {
  const all = await loadTransactions();
  const index = all.findIndex((t) => t.id === tx.id);
  let updated: Tx[];
  if (index >= 0) {
    updated = [...all];
    updated[index] = tx;
  } else {
    updated = [tx, ...all];
  }
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteTransaction(id: string): Promise<Tx[]> {
  const all = await loadTransactions();
  const updated = all.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteTransactionsByBook(bookId: string): Promise<Tx[]> {
  const all = await loadTransactions();
  const updated = all.filter((t) => t.book !== bookId);
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(updated));
  return updated;
}

export async function exportBackup(): Promise<string> {
  const txs = await loadTransactions();
  const data: BackupData = {
    app: 'buku-kas-ibuk',
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: txs,
  };
  return JSON.stringify(data, null, 2);
}

export async function importBackup(jsonString: string): Promise<Tx[]> {
  const parsed = JSON.parse(jsonString);
  if (parsed?.app !== 'buku-kas-ibuk' || !Array.isArray(parsed?.transactions)) {
    throw new Error('File cadangan tidak sesuai atau rusak.');
  }
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(parsed.transactions));
  return parsed.transactions;
}

export async function ensureSeedData(): Promise<Tx[]> {
  const current = await loadTransactions();
  if (current.length > 0) return current;

  const today = todayISO();
  const seed: Tx[] = [
    // Sekolah
    {
      id: 'seed-sek-1',
      book: 'sekolah',
      type: 'in',
      amount: 1500000,
      category: 'Saldo awal',
      note: 'Kas sekolah awal semester',
      date: today,
      createdAt: Date.now() - 3000,
    },
    {
      id: 'seed-sek-2',
      book: 'sekolah',
      type: 'in',
      amount: 450000,
      category: 'Iuran siswa',
      note: 'Iuran kas kelas 3 murid',
      date: today,
      createdAt: Date.now() - 2000,
    },
    {
      id: 'seed-sek-3',
      book: 'sekolah',
      type: 'out',
      amount: 75000,
      category: 'ATK & fotokopi',
      note: 'Kertas HVS & spidol papan tulis',
      date: today,
      createdAt: Date.now() - 1000,
    },

    // Ibu-Ibu
    {
      id: 'seed-ibu-1',
      book: 'ibu',
      type: 'in',
      amount: 800000,
      category: 'Iuran bulanan',
      note: 'Iuran kas PKK RT 03',
      date: today,
      createdAt: Date.now() - 3000,
    },
    {
      id: 'seed-ibu-2',
      book: 'ibu',
      type: 'out',
      amount: 120000,
      category: 'Konsumsi',
      note: 'Snack rapat bulanan',
      date: today,
      createdAt: Date.now() - 2000,
    },

    // Rumah
    {
      id: 'seed-rum-1',
      book: 'rumah',
      type: 'in',
      amount: 3500000,
      category: 'Uang bulanan',
      note: 'Nafkah belanja rumah',
      date: today,
      createdAt: Date.now() - 3000,
    },
    {
      id: 'seed-rum-2',
      book: 'rumah',
      type: 'out',
      amount: 185000,
      category: 'Belanja dapur',
      note: 'Beras, sayuran, dan telur',
      date: today,
      createdAt: Date.now() - 2000,
    },
  ];

  await AsyncStorage.setItem(TX_KEY, JSON.stringify(seed));
  return seed;
}
