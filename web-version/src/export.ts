// PDF/Excel reports. Libraries are imported on demand so they don't slow down opening the app.
import { longDate, monthLabel, rupiah, shortDate, todayISO, type MonthReport } from './money';
import { downloadBlob } from './device';

// The built-in PDF font has no "−" (U+2212); use a plain hyphen.
const rp = (n: number) => rupiah(n).replace('−', '-');
const fileBase = (bookName: string, r: MonthReport) => `Laporan ${bookName} ${r.month}`;
const describe = (t: MonthReport['items'][number]) => (t.note ? `${t.category} — ${t.note}` : t.category);

export async function downloadPdf(bookName: string, r: MonthReport) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const x = 16;

  doc.setFont('helvetica', 'bold').setFontSize(18).text(`Laporan ${bookName}`, x, 22);
  doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(90).text(`Bulan ${monthLabel(r.month)}`, x, 30);

  autoTable(doc, {
    startY: 38,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 1.6 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    tableWidth: 110,
    margin: { left: x },
    body: [
      ['Saldo bulan lalu', rp(r.opening)],
      ['Uang masuk', rp(r.income)],
      ['Uang keluar', rp(r.expense)],
      ['Sisa saldo', rp(r.closing)],
    ],
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    margin: { left: x, right: x },
    headStyles: { fillColor: [242, 242, 247], textColor: 20, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 2.4, lineColor: [225, 225, 230], lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 22 }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    head: [['No', 'Tanggal', 'Keterangan', 'Masuk', 'Keluar']],
    body: r.items.length
      ? r.items.map((t, i) => [
          i + 1,
          shortDate(t.date),
          describe(t),
          t.type === 'in' ? rp(t.amount) : '',
          t.type === 'out' ? rp(t.amount) : '',
        ])
      : [['', '', 'Tidak ada catatan bulan ini', '', '']],
    foot: [['', '', 'Jumlah', rp(r.income), rp(r.expense)]],
    footStyles: { fillColor: [242, 242, 247], textColor: 20, fontStyle: 'bold', halign: 'right' },
  });

  const y = (doc as any).lastAutoTable.finalY + 16;
  doc.setFontSize(11).setTextColor(20).text(longDate(todayISO()), 194, y, { align: 'right' });
  doc.text('Bendahara,', 194, y + 7, { align: 'right' });
  doc.text('(..............................)', 194, y + 32, { align: 'right' });

  downloadBlob(doc.output('blob'), `${fileBase(bookName, r)}.pdf`);
}

export async function downloadExcel(bookName: string, r: MonthReport) {
  const XLSX = await import('xlsx');
  const rows: (string | number)[][] = [
    [`Laporan ${bookName}`],
    [`Bulan ${monthLabel(r.month)}`],
    [],
    ['Saldo bulan lalu', r.opening],
    ['Uang masuk', r.income],
    ['Uang keluar', r.expense],
    ['Sisa saldo', r.closing],
    [],
    ['Tanggal', 'Kategori', 'Keterangan', 'Masuk', 'Keluar'],
    ...r.items.map((t) => [
      t.date,
      t.category,
      t.note,
      t.type === 'in' ? t.amount : '',
      t.type === 'out' ? t.amount : '',
    ]),
    ['', '', 'Jumlah', r.income, r.expense],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 32 }, { wch: 14 }, { wch: 14 }];
  for (const cell of Object.values(ws)) if (cell?.t === 'n') cell.z = '#,##0'; // Excel shows 1,250,000 / 1.250.000 per locale
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, r.month);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${fileBase(bookName, r)}.xlsx`,
  );
}
