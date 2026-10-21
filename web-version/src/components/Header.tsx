import { BookSvgIcon, PlusIcon, ArchiveIcon } from './SvgIcons';
import { longDate, todayISO, type BookId } from '../money';
import { haptic } from '../device';
import type { Book } from '../books';

interface Props {
  books: Book[];
  activeBook: BookId;
  onSelectBook: (id: BookId) => void;
  onOpenBackup: () => void;
  onOpenManageBooks: () => void;
}

export function Header({
  books,
  activeBook,
  onSelectBook,
  onOpenBackup,
  onOpenManageBooks,
}: Props) {
  const today = longDate(todayISO());

  const handleBookChange = (id: BookId) => {
    if (id !== activeBook) {
      haptic(15);
      onSelectBook(id);
    }
  };

  return (
    <header className="app-header">
      <div className="header-top">
        <span className="header-date">{today}</span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            haptic(10);
            onOpenBackup();
          }}
          aria-label="Cadangkan dan Pulihkan Data"
          title="Cadangkan Data"
        >
          <ArchiveIcon size={18} color="#64748B" />
        </button>
      </div>

      {/* Segmented Control Bar with Manage & Add Book Action */}
      <div className="segmented-control-bar">
        <nav className="segmented-control" role="tablist" aria-label="Pilih Buku Kas">
          {books.map((b) => {
            const isActive = b.id === activeBook;
            return (
              <button
                key={b.id}
                role="tab"
                aria-selected={isActive}
                className={`segment-item ${isActive ? 'active' : ''}`}
                onClick={() => handleBookChange(b.id)}
              >
                <BookSvgIcon
                  icon={b.icon || b.id}
                  size={16}
                  color={isActive ? '#0F172A' : '#64748B'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{b.short}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="segment-add-btn"
          onClick={() => {
            haptic(10);
            onOpenManageBooks();
          }}
          aria-label="Kelola dan Tambah Buku Kas"
          title="Kelola / Tambah Buku Kas"
        >
          <PlusIcon size={17} color="var(--label-primary)" strokeWidth={2.4} />
        </button>
      </div>
    </header>
  );
}
