import { dayLabel, monthLabel, rupiah, shiftMonth, type Tx } from '../money';
import type { BookId } from '../money';
import { haptic } from '../device';
import {
  CategorySvgIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ImageIcon,
} from './SvgIcons';

interface Props {
  bookId: BookId;
  month: string;
  transactions: Tx[];
  onSelectMonth: (m: string) => void;
  onSelectTx: (t: Tx) => void;
  onViewPhoto: (txId: number) => void;
}

// Category semantic subtle tint palette (Apple HIG Inset Palette)
function getCategoryTint(name: string, type: 'in' | 'out'): { bg: string; iconColor: string } {
  if (type === 'in') {
    return { bg: '#ECFDF5', iconColor: '#059669' };
  }
  const norm = name.toLowerCase();
  if (norm.includes('belanja') || norm.includes('konsumsi') || norm.includes('dapur')) {
    return { bg: '#FEF3C7', iconColor: '#D97706' }; // Warm amber
  }
  if (norm.includes('atk') || norm.includes('fotokopi') || norm.includes('sekolah')) {
    return { bg: '#E0F2FE', iconColor: '#0284C7' }; // Clear sky blue
  }
  if (norm.includes('sosial') || norm.includes('iuran') || norm.includes('pkk')) {
    return { bg: '#F3E8FF', iconColor: '#7C3AED' }; // Soft violet
  }
  if (norm.includes('listrik') || norm.includes('air') || norm.includes('wifi')) {
    return { bg: '#EDE9FE', iconColor: '#6366F1' }; // Indigo
  }
  return { bg: '#F3F4F6', iconColor: '#4B5563' }; // Neutral slate
}

export function TransactionList({
  bookId,
  month,
  transactions,
  onSelectMonth,
  onSelectTx,
  onViewPhoto
}: Props) {
  // Filter transactions for this book and month
  const currentMonthTxs = transactions
    .filter((t) => t.book === bookId && t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  // Group by date
  const grouped = currentMonthTxs.reduce<Record<string, Tx[]>>((acc, t) => {
    (acc[t.date] = acc[t.date] || []).push(t);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <section aria-label="Riwayat Transaksi">
      {/* Integrated Journal Month Header */}
      <div className="month-bar">
        <span className="month-title">{monthLabel(month)}</span>

        <div className="month-nav-controls">
          <button
            type="button"
            className="month-btn prev"
            onClick={() => {
              haptic(10);
              onSelectMonth(shiftMonth(month, -1));
            }}
            aria-label="Bulan Sebelumnya"
            title="Bulan Sebelumnya"
          >
            <ChevronLeftIcon size={16} strokeWidth={2} />
          </button>

          <button
            type="button"
            className="month-btn next"
            onClick={() => {
              haptic(10);
              onSelectMonth(shiftMonth(month, 1));
            }}
            aria-label="Bulan Berikutnya"
            title="Bulan Berikutnya"
          >
            <ChevronRightIcon size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <DocumentTextIcon size={34} color="#94A3B8" />
          </div>
          <div className="empty-title">Belum Ada Catatan</div>
          <div className="empty-sub">
            Ketuk tombol hijau atau merah di bawah untuk mencatat transaksi baru.
          </div>
        </div>
      ) : (
        dates.map((d) => (
          <div key={d} className="date-group">
            <div className="date-group-header">{dayLabel(d)}</div>
            <div className="tx-card-list">
              {grouped[d].map((t) => {
                const tint = getCategoryTint(t.category, t.type);
                return (
                  <div
                    key={t.id}
                    className="tx-row"
                    onClick={() => {
                      haptic(10);
                      onSelectTx(t);
                    }}
                  >
                    <div className="tx-leading">
                      <div className="tx-icon-bubble" style={{ backgroundColor: tint.bg }}>
                        <CategorySvgIcon name={t.category} size={20} color={tint.iconColor} />
                      </div>
                      <div className="tx-text">
                        <div className="tx-category">
                          <span>{t.category}</span>
                          {t.hasPhoto && (
                            <span
                              className="tx-photo-badge"
                              onClick={(e) => {
                                e.stopPropagation();
                                haptic(10);
                                if (t.id) onViewPhoto(t.id);
                              }}
                            >
                              <ImageIcon size={11} color="#0A84FF" />
                              <span>Nota</span>
                            </span>
                          )}
                        </div>
                        {t.note && <div className="tx-note">{t.note}</div>}
                      </div>
                    </div>

                    <div className="tx-trailing">
                      <div className={`tx-amount tnum ${t.type}`}>
                        {t.type === 'in' ? '+' : '−'}
                        {rupiah(t.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
