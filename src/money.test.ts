import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthReport, parseAmount, rupiah, shiftMonth, todayISO, whatsappText } from './money.ts';
import type { Tx } from './types.ts';

const tx = (p: Partial<Tx>): Tx => ({
  id: '1',
  book: 'sekolah',
  type: 'in',
  amount: 1000,
  category: 'Lainnya',
  note: '',
  date: '2026-10-01',
  createdAt: 0,
  ...p,
});

test('rupiah formats Indonesian thousands and negatives', () => {
  assert.equal(rupiah(1250000), 'Rp 1.250.000');
  assert.equal(rupiah(0), 'Rp 0');
  assert.equal(rupiah(-5000), '−Rp 5.000');
});

test('parseAmount reads typed or formatted text', () => {
  assert.equal(parseAmount('Rp 1.250.000'), 1250000);
  assert.equal(parseAmount('50000'), 50000);
  assert.equal(parseAmount(''), 0);
  assert.equal(parseAmount('abc'), 0);
  assert.ok(Number.isSafeInteger(parseAmount('9'.repeat(30))));
});

test('todayISO uses the local date, not UTC', () => {
  assert.equal(todayISO(new Date(2026, 9, 21, 0, 30)), '2026-10-21');
  assert.equal(todayISO(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('shiftMonth crosses year boundaries', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
});

test('monthReport splits opening, income, expense, closing', () => {
  const txs = [
    tx({ type: 'in', amount: 500000, date: '2026-09-10' }),
    tx({ type: 'out', amount: 100000, date: '2026-09-20' }),
    tx({ type: 'in', amount: 200000, date: '2026-10-05', createdAt: 2 }),
    tx({ type: 'out', amount: 50000, date: '2026-10-03' }),
    tx({ type: 'in', amount: 999, date: '2026-11-01' }),
  ];
  const r = monthReport(txs, '2026-10');
  assert.equal(r.opening, 400000);
  assert.equal(r.income, 200000);
  assert.equal(r.expense, 50000);
  assert.equal(r.closing, 550000);
  assert.deepEqual(r.items.map((t) => t.date), ['2026-10-03', '2026-10-05']);
});

test('whatsappText contains totals and every item', () => {
  const r = monthReport(
    [tx({ amount: 75000, category: 'Iuran siswa', note: 'Kelas 3' })],
    '2026-10'
  );
  const text = whatsappText('Kas Sekolah', r);
  assert.match(text, /LAPORAN KAS SEKOLAH/);
  assert.match(text, /Iuran siswa \(Kelas 3\): Rp 75\.000/);
  assert.match(text, /Sisa saldo: Rp 75\.000/);
});
