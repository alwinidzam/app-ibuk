import type { MonthReport, Tx } from './types';

// Format rupiah reliably without depending on device Intl/ICU data (crash-proof on all Android devices)
export function rupiah(n: number): string {
  const abs = Math.abs(Math.round(n));
  const s = 'Rp ' + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? '−' + s : s;
}

export function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '').slice(0, 13);
  return digits ? Number(digits) : 0;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const monthOf = (date: string) => date.slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function monthLabel(month: string): string {
  const parts = month.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const name = MONTH_NAMES[Math.max(0, Math.min(11, m - 1))];
  return `${name} ${y}`;
}

export function shortDate(date: string): string {
  const parts = date.split('-').map(Number);
  const m = parts[1] || 1;
  const d = parts[2] || 1;
  const name = SHORT_MONTH_NAMES[Math.max(0, Math.min(11, m - 1))];
  return `${d} ${name}`;
}

export function dayLabel(date: string): string {
  const parts = date.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const d = parts[2] || 1;
  const dt = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[dt.getDay()] || 'Senin';
  const monthName = MONTH_NAMES[Math.max(0, Math.min(11, m - 1))];
  return `${dayName}, ${d} ${monthName}`;
}

export function longDate(date: string): string {
  const parts = date.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const d = parts[2] || 1;
  const dt = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[dt.getDay()] || 'Senin';
  const monthName = MONTH_NAMES[Math.max(0, Math.min(11, m - 1))];
  return `${dayName}, ${d} ${monthName} ${y}`;
}

const signed = (t: Tx) => (t.type === 'in' ? t.amount : -t.amount);

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
    'Terima kasih.',
  ].join('\n');
}
