import { rupiah, type MonthReport } from '../money';
import { bookById, type Book } from '../books';
import type { BookId } from '../money';
import { ArrowDownIcon, ArrowUpIcon } from './SvgIcons';

interface Props {
  bookId: BookId;
  books?: Book[];
  report: MonthReport;
  onSelectBook?: (id: BookId) => void;
}

export function BalanceCard({ bookId, books, report }: Props) {
  const book = bookById(bookId, books);

  return (
    <section className="balance-hero-card" aria-label="Ringkasan Saldo Kas">
      {/* Top Header of Passbook Card */}
      <div className="hero-top-row">
        <div className="hero-book-tag">
          <span
            className="hero-book-dot"
            style={{ backgroundColor: book.accentColor || 'var(--book-tint, #0A84FF)' }}
          />
          <span className="hero-book-title">{book.name}</span>
        </div>
        <span className="hero-status-pill">Saldo Berjalan</span>
      </div>

      {/* Hero Tabular Balance Amount */}
      <div className="hero-balance-content">
        <span className="hero-currency-prefix">Rp</span>
        <span className="hero-balance-amount tnum">
          {rupiah(report.closing).replace('Rp\u00A0', '').replace('Rp ', '')}
        </span>
      </div>

      {/* Integrated Two-Column Metrics Bar (Radical Subtraction: No card-within-card) */}
      <div className="hero-metrics-bar">
        <div className="hero-metric-item">
          <div className="hero-metric-header">
            <span className="hero-metric-icon in">
              <ArrowDownIcon size={13} color="#059669" strokeWidth={2.5} />
            </span>
            <span className="hero-metric-label">Uang Masuk</span>
          </div>
          <div className="hero-metric-val in tnum">+{rupiah(report.income)}</div>
        </div>

        <div className="hero-metric-divider" />

        <div className="hero-metric-item">
          <div className="hero-metric-header">
            <span className="hero-metric-icon out">
              <ArrowUpIcon size={13} color="#DC2626" strokeWidth={2.5} />
            </span>
            <span className="hero-metric-label">Uang Keluar</span>
          </div>
          <div className="hero-metric-val out tnum">−{rupiah(report.expense)}</div>
        </div>
      </div>
    </section>
  );
}
