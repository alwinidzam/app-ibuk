import { useState } from 'react';
import { Sheet } from './Sheet';
import { monthLabel, rupiah, whatsappText, type MonthReport } from '../money';
import { bookById } from '../books';
import type { BookId } from '../money';
import { downloadPdf, downloadExcel } from '../export';
import { openWhatsApp, haptic } from '../device';
import { DocumentTextIcon, PrintIcon, ShareIcon, WhatsAppIcon } from './SvgIcons';

interface Props {
  bookId: BookId;
  report: MonthReport;
  onClose: () => void;
}

export function ReportModal({ bookId, report, onClose }: Props) {
  const book = bookById(bookId);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);

  const textWA = whatsappText(book.name, report);

  const handleCopyWA = () => {
    haptic(10);
    navigator.clipboard.writeText(textWA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWA = () => {
    haptic(15);
    openWhatsApp(textWA);
  };

  const handleDownloadPdf = async () => {
    haptic(15);
    setDownloading('pdf');
    try {
      await downloadPdf(book.name, report);
    } catch {
      alert('Gagal membuat dokumen PDF.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadExcel = async () => {
    haptic(15);
    setDownloading('excel');
    try {
      await downloadExcel(book.name, report);
    } catch {
      alert('Gagal membuat file Excel.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Sheet title={`Laporan ${book.name}`} onClose={onClose} dismissible>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Periode Pembukuan</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          {monthLabel(report.month)}
        </div>
      </div>

      {/* Summary Box */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Saldo bulan lalu</span>
          <span className="tnum" style={{ fontWeight: 600 }}>{rupiah(report.opening)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total uang masuk</span>
          <span className="tnum" style={{ fontWeight: 700, color: 'var(--apple-green)' }}>+{rupiah(report.income)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total uang keluar</span>
          <span className="tnum" style={{ fontWeight: 700, color: 'var(--apple-red)' }}>−{rupiah(report.expense)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', fontSize: 17 }}>
          <span style={{ fontWeight: 700 }}>Sisa saldo kas</span>
          <span className="tnum" style={{ fontWeight: 800 }}>{rupiah(report.closing)}</span>
        </div>
      </div>

      {/* WhatsApp Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Bagikan ke Grup WhatsApp
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="dock-btn"
            style={{ background: '#25D366', color: '#FFFFFF', flex: 1.3 }}
            onClick={handleOpenWA}
          >
            <WhatsAppIcon size={20} color="#FFFFFF" />
            <span>Kirim ke WhatsApp</span>
          </button>

          <button
            type="button"
            className="dock-btn"
            style={{ background: '#F1F5F9', color: 'var(--text-primary)', flex: 1, border: '1px solid rgba(0,0,0,0.08)' }}
            onClick={handleCopyWA}
          >
            <ShareIcon size={18} color="var(--text-primary)" />
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>
      </div>

      {/* Export PDF & Excel */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Unduh Dokumen Arsip
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            className="dock-btn"
            style={{ background: '#F0F9FF', border: '1px solid rgba(2, 132, 199, 0.3)', color: '#0284C7' }}
            disabled={downloading !== null}
            onClick={handleDownloadPdf}
          >
            <PrintIcon size={20} color="#0284C7" />
            <span>{downloading === 'pdf' ? 'Membuat...' : 'Unduh PDF'}</span>
          </button>

          <button
            type="button"
            className="dock-btn"
            style={{ background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
            disabled={downloading !== null}
            onClick={handleDownloadExcel}
          >
            <DocumentTextIcon size={18} color="#10B981" />
            <span>{downloading === 'excel' ? 'Membuat...' : 'Unduh Excel'}</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
}
