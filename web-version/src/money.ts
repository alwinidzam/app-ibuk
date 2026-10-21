// Pure money/date helpers — no React, no DB, so `node --test` can run them directly.

export type BookId = string;
export type TxType = 'in' | 'out';

export interface Tx {
  id?: number;
  book: BookId;
  type: TxType;
  amount: number; // whole rupiah, always > 0
  category: string;
  note: string;
  date: string; // YYYY-MM-DD (local date, not UTC)
  hasPhoto: boolean;
  createdAt: number;
}

const rupiahFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** 1250000 → "Rp 1.250.000", -5000 → "−Rp 5.000" */
export function rupiah(n: number): string {
  const s = 'Rp ' + rupiahFmt.format(Math.abs(n));
  return n < 0 ? '−' + s : s;
}

/** "Rp 1.250.000" / "1250000" / "1.250.000" → 1250000. Anything without digits → 0. */
export function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '').slice(0, 13); // < 10 triliun; keeps Number exact
  return digits ? Number(digits) : 0;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date. toISOString() would be UTC and give "yesterday" before 07:00 WIB. */
export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const monthOf = (date: string) => date.slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// Dates are built at local noon so no timezone can push them to another day.
const asDate = (iso: string) => new Date(iso.length === 7 ? `${iso}-01T12:00` : `${iso}T12:00`);

export const monthLabel = (month: string) =>
  asDate(month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export const dayLabel = (date: string) =>
  asDate(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

export const shortDate = (date: string) =>
  asDate(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export const longDate = (date: string) =>
  asDate(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const signed = (t: Tx) => (t.type === 'in' ? t.amount : -t.amount);

export function balance(txs: Tx[]): number {
  return txs.reduce((sum, t) => sum + signed(t), 0);
}

export interface MonthReport {
  month: string;
  opening: number; // saldo before this month
  income: number;
  expense: number;
  closing: number;
  items: Tx[]; // this month, oldest first
}

export function monthReport(txs: Tx[], month: string): MonthReport {
  let opening = 0, income = 0, expense = 0;
  const items: Tx[] = [];
  for (const t of txs) {
    const m = monthOf(t.date);
    if (m < month) opening += signed(t);
    else if (m === month) {
      items.push(t);
      if (t.type === 'in') income += t.amount;
      else expense += t.amount;
    }
  }
  items.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  return { month, opening, income, expense, closing: opening + income - expense, items };
}

const line = (t: Tx) =>
  `• ${shortDate(t.date)} – ${t.category}${t.note ? ` (${t.note})` : ''}: ${rupiah(t.amount)}`;

/** WhatsApp-ready text. *bold* is WhatsApp markup. */
export function whatsappText(bookName: string, r: MonthReport): string {
  const ins = r.items.filter((t) => t.type === 'in');
  const outs = r.items.filter((t) => t.type === 'out');
  return [
    `*LAPORAN ${bookName.toUpperCase()}*`,
    `Bulan ${monthLabel(r.month)}`,
    '',
    `Saldo bulan lalu: ${rupiah(r.opening)}`,
    '',
    `*Uang Masuk: ${rupiah(r.income)}*`,
    ...(ins.length ? ins.map(line) : ['• (tidak ada)']),
    '',
    `*Uang Keluar: ${rupiah(r.expense)}*`,
    ...(outs.length ? outs.map(line) : ['• (tidak ada)']),
    '',
    `*Sisa saldo: ${rupiah(r.closing)}*`,
    '',
    'Terima kasih 🙏',
  ].join('\n');
}
