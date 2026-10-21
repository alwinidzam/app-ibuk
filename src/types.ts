export type BookId = string;
export type TxType = 'in' | 'out';

export interface Tx {
  id: string;
  book: BookId;
  type: TxType;
  amount: number; // whole rupiah, > 0
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  photoUri?: string; // local file URI or base64
  createdAt: number;
}

export interface Category {
  name: string;
}

export interface Book {
  id: BookId;
  short: string;
  name: string;
  icon?: string;
  accentColor?: string;
  accentBg?: string;
  categories: Record<TxType, Category[]>;
}

export interface MonthReport {
  month: string;
  opening: number;
  income: number;
  expense: number;
  closing: number;
  items: Tx[];
}

export interface BackupData {
  app: 'buku-kas-ibuk';
  version: 1;
  exportedAt: string;
  transactions: Tx[];
}
