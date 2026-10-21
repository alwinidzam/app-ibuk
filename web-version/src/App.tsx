import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveTx, deleteTx } from './db';
import { monthOf, monthReport, todayISO, type BookId, type Tx, type TxType } from './money';
import { loadStoredBooks, setBooksCache, type Book } from './books';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { FloatingDock } from './components/FloatingDock';
import { TransactionModal } from './components/TransactionModal';
import { ReportModal } from './components/ReportModal';
import { BackupModal } from './components/BackupModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ManageBooksModal } from './components/ManageBooksModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { AmbientBackground } from './components/AmbientBackground';

// Seed starter transactions if database is fresh
async function ensureSeedData() {
  const count = await db.tx.count();
  if (count > 0) return;

  const today = todayISO();
  const starterTxs: Tx[] = [
    // Sekolah
    {
      book: 'sekolah',
      type: 'in',
      amount: 1_500_000,
      category: 'Saldo awal',
      note: 'Kas sekolah awal semester',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 3000
    },
    {
      book: 'sekolah',
      type: 'in',
      amount: 450_000,
      category: 'Iuran siswa',
      note: 'Iuran kas kelas 3 murid',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 2000
    },
    {
      book: 'sekolah',
      type: 'out',
      amount: 75_000,
      category: 'ATK & fotokopi',
      note: 'Kertas HVS & spidol papan tulis',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 1000
    },

    // Ibu-Ibu
    {
      book: 'ibu',
      type: 'in',
      amount: 800_000,
      category: 'Iuran bulanan',
      note: 'Iuran kas PKK RT 03',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 3000
    },
    {
      book: 'ibu',
      type: 'out',
      amount: 120_000,
      category: 'Konsumsi',
      note: 'Snack rapat bulanan',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 2000
    },

    // Rumah
    {
      book: 'rumah',
      type: 'in',
      amount: 3_500_000,
      category: 'Uang bulanan',
      note: 'Nafkah belanja rumah',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 3000
    },
    {
      book: 'rumah',
      type: 'out',
      amount: 185_000,
      category: 'Belanja dapur',
      note: 'Beras, sayuran, dan telur',
      date: today,
      hasPhoto: false,
      createdAt: Date.now() - 2000
    }
  ];

  await db.tx.bulkAdd(starterTxs);
}

export function App() {
  const [books, setBooks] = useState<Book[]>(() => loadStoredBooks());
  const [activeBook, setActiveBook] = useState<BookId>(() => {
    const loaded = loadStoredBooks();
    return loaded[0]?.id || 'sekolah';
  });
  const [currentMonth, setCurrentMonth] = useState<string>(monthOf(todayISO()));

  // Modals state
  const [createType, setCreateType] = useState<TxType | null>(null);
  const [selectedDetailTx, setSelectedDetailTx] = useState<Tx | null>(null);
  const [txToEdit, setTxToEdit] = useState<Tx | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [showBackup, setShowBackup] = useState<boolean>(false);
  const [showManageBooks, setShowManageBooks] = useState<boolean>(false);
  const [viewPhotoId, setViewPhotoId] = useState<number | null>(null);

  // Initialize seed data on start
  useEffect(() => {
    ensureSeedData();
  }, []);

  // Reactive live query from IndexedDB
  const allTxs = useLiveQuery(() => db.tx.toArray(), []) ?? [];

  // Filter for active book
  const bookTxs = allTxs.filter((t) => t.book === activeBook);
  const report = monthReport(bookTxs, currentMonth);

  return (
    <div className={`theme-${activeBook}`}>
      <AmbientBackground book={activeBook} />

      <main className="app-viewport">
        {/* Header with Segmented Control & Manage Books Action */}
        <Header
          books={books}
          activeBook={activeBook}
          onSelectBook={setActiveBook}
          onOpenBackup={() => setShowBackup(true)}
          onOpenManageBooks={() => setShowManageBooks(true)}
        />

        {/* Hero Balance Card */}
        <BalanceCard
          bookId={activeBook}
          books={books}
          report={report}
          onSelectBook={setActiveBook}
        />

        {/* Grouped Transaction History */}
        <TransactionList
          bookId={activeBook}
          month={currentMonth}
          transactions={allTxs}
          onSelectMonth={setCurrentMonth}
          onSelectTx={setSelectedDetailTx}
          onViewPhoto={setViewPhotoId}
        />

        {/* Floating Liquid Glass Dock */}
        <FloatingDock
          onOpenCreate={setCreateType}
          onOpenReport={() => setShowReport(true)}
        />

        {/* Transaction Detail & Safe Actions Sheet */}
        {selectedDetailTx && (
          <TransactionDetailModal
            tx={selectedDetailTx}
            onClose={() => setSelectedDetailTx(null)}
            onEdit={(tx) => {
              setSelectedDetailTx(null);
              setTxToEdit(tx);
            }}
            onDelete={async (id) => {
              await deleteTx(id);
              setSelectedDetailTx(null);
            }}
            onViewPhoto={(photoId) => {
              setViewPhotoId(photoId);
            }}
          />
        )}

        {/* Create Transaction Modal */}
        {createType && (
          <TransactionModal
            bookId={activeBook}
            initialType={createType}
            onClose={() => setCreateType(null)}
            onSave={saveTx}
          />
        )}

        {/* Edit Transaction Modal */}
        {txToEdit && (
          <TransactionModal
            bookId={activeBook}
            initialType={txToEdit.type}
            txToEdit={txToEdit}
            onClose={() => setTxToEdit(null)}
            onSave={saveTx}
            onDelete={deleteTx}
          />
        )}

        {/* Monthly Report Modal */}
        {showReport && (
          <ReportModal
            bookId={activeBook}
            report={report}
            onClose={() => setShowReport(false)}
          />
        )}

        {/* Backup & Restore Modal */}
        {showBackup && (
          <BackupModal
            onClose={() => setShowBackup(false)}
            onRestored={() => {
              // Trigger reload of month view if needed
              setCurrentMonth(monthOf(todayISO()));
            }}
          />
        )}

        {/* Manage & Add Custom Books Modal */}
        {showManageBooks && (
          <ManageBooksModal
            books={books}
            activeBookId={activeBook}
            onClose={() => setShowManageBooks(false)}
            onBooksChanged={(updated, newActiveId) => {
              setBooks(updated);
              setBooksCache(updated);
              if (newActiveId) {
                setActiveBook(newActiveId);
              } else if (!updated.some((b) => b.id === activeBook)) {
                setActiveBook(updated[0]?.id || 'sekolah');
              }
            }}
          />
        )}

        {/* Receipt Photo Viewer Modal */}
        {viewPhotoId !== null && (
          <ReceiptModal
            photoId={viewPhotoId}
            onClose={() => setViewPhotoId(null)}
          />
        )}
      </main>
    </div>
  );
}
export default App;
