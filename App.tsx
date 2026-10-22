import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeHeader } from './src/components/NativeHeader';
import { NativeAmbientBackground } from './src/components/NativeAmbientBackground';
import { NativeBalanceCard } from './src/components/NativeBalanceCard';
import { NativeTransactionList } from './src/components/NativeTransactionList';
import { NativeDock } from './src/components/NativeDock';
import { NativeTransactionModal } from './src/components/NativeTransactionModal';
import { NativeTransactionDetailModal } from './src/components/NativeTransactionDetailModal';
import { NativeReportModal } from './src/components/NativeReportModal';
import { NativeBackupModal } from './src/components/NativeBackupModal';
import { NativePhotoModal } from './src/components/NativePhotoModal';
import { NativeManageBooksModal } from './src/components/NativeManageBooksModal';
import {
  ensureSeedData,
  saveTransaction,
  deleteTransaction,
} from './src/storage';
import { monthOf, monthReport, todayISO } from './src/money';
import { DEFAULT_BOOKS, loadStoredBooks } from './src/books';
import type { Book, BookId, Tx, TxType } from './src/types';

// Silence non-critical development warnings on screen for a pristine experience
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Cannot connect to Expo CLI',
]);

// Crash-proof Error Boundary so Expo Go never falls back to generic crash screen
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Buku Kas Ibuk Crash Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Ups, Terjadi Kendala</Text>
          <Text style={styles.errorMsg}>
            {this.state.error?.message || 'Aplikasi mengalami kesalahan teknis.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryBtnText}>Muat Ulang Aplikasi</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [activeBook, setActiveBook] = useState<BookId>('sekolah');
  const [currentMonth, setCurrentMonth] = useState<string>(monthOf(todayISO()));
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createType, setCreateType] = useState<TxType | null>(null);
  const [txToEdit, setTxToEdit] = useState<Tx | null>(null);
  const [selectedDetailTx, setSelectedDetailTx] = useState<Tx | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showManageBooks, setShowManageBooks] = useState(false);
  const [viewPhotoUri, setViewPhotoUri] = useState<string | null>(null);

  // Load stored books and seed initial transactions
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [seeded, storedBooks] = await Promise.all([
          ensureSeedData(),
          loadStoredBooks(),
        ]);
        if (mounted) {
          setTransactions(seeded);
          setBooks(storedBooks);
          if (storedBooks.length > 0 && !storedBooks.some((b) => b.id === activeBook)) {
            setActiveBook(storedBooks[0].id);
          }
        }
      } catch (err) {
        console.error('Storage init failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveTx = async (tx: Tx) => {
    const updated = await saveTransaction(tx);
    setTransactions(updated);
  };

  const handleDeleteTx = async (id: string) => {
    const updated = await deleteTransaction(id);
    setTransactions(updated);
  };

  const handleSwipeBook = (direction: 'next' | 'prev') => {
    const order: BookId[] = books.map((b) => b.id);
    const idx = order.indexOf(activeBook);
    if (direction === 'next' && idx < order.length - 1) {
      setActiveBook(order[idx + 1]);
    } else if (direction === 'prev' && idx > 0) {
      setActiveBook(order[idx - 1]);
    }
  };

  // Filter report for active book and selected month
  const bookTxs = transactions.filter((t) => t.book === activeBook);
  const report = monthReport(bookTxs, currentMonth);

  // Ambient background colors
  const currentBook = books.find((b) => b.id === activeBook) || books[0];
  const ambientColors = currentBook?.accentBg || '#F0F9FF';

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NativeAmbientBackground activeBook={activeBook} />
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}
      >
        <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Pure SVG Segmented Control with Manage & Add Action */}
        <NativeHeader
          books={books}
          activeBook={activeBook}
          onSelectBook={setActiveBook}
          onOpenBackup={() => setShowBackup(true)}
          onOpenManageBooks={() => setShowManageBooks(true)}
        />

        {/* Hero Balance Card with Parallax Swipe Between Books & Touchable Pagination */}
        <NativeBalanceCard
          bookId={activeBook}
          books={books}
          report={report}
          onSwipeBook={handleSwipeBook}
          onSelectBook={setActiveBook}
        />

        {/* Grouped Transaction List with Pure SVG Icons */}
        <NativeTransactionList
          bookId={activeBook}
          month={currentMonth}
          transactions={transactions}
          onSelectMonth={setCurrentMonth}
          onSelectTx={setSelectedDetailTx}
          onViewPhoto={setViewPhotoUri}
        />
      </ScrollView>

      {/* Floating Action Dock */}
      <NativeDock
        onOpenCreate={(type) => setCreateType(type)}
        onOpenReport={() => setShowReport(true)}
      />

      {/* Transaction Detail Inspector Modal */}
      <NativeTransactionDetailModal
        visible={!!selectedDetailTx}
        tx={selectedDetailTx}
        onClose={() => setSelectedDetailTx(null)}
        onEdit={(tx) => {
          setSelectedDetailTx(null);
          setTxToEdit(tx);
        }}
        onDelete={async (id) => {
          setSelectedDetailTx(null);
          await handleDeleteTx(id);
        }}
        onViewPhoto={setViewPhotoUri}
      />

      {/* Create Transaction Modal */}
      {createType && (
        <NativeTransactionModal
          visible={!!createType}
          bookId={activeBook}
          initialType={createType}
          onClose={() => setCreateType(null)}
          onSave={handleSaveTx}
        />
      )}

      {/* Edit Transaction Modal */}
      {txToEdit && (
        <NativeTransactionModal
          visible={!!txToEdit}
          bookId={activeBook}
          initialType={txToEdit.type}
          txToEdit={txToEdit}
          onClose={() => setTxToEdit(null)}
          onSave={handleSaveTx}
          onDelete={handleDeleteTx}
        />
      )}

      {/* Monthly Report Modal */}
      <NativeReportModal
        visible={showReport}
        bookId={activeBook}
        report={report}
        onClose={() => setShowReport(false)}
      />

      {/* Backup & Restore Modal */}
      <NativeBackupModal
        visible={showBackup}
        onClose={() => setShowBackup(false)}
        onRestored={(restored) => {
          setTransactions(restored);
        }}
      />

      {/* Manage Books Modal */}
      <NativeManageBooksModal
        visible={showManageBooks}
        books={books}
        activeBookId={activeBook}
        transactions={transactions}
        onClose={() => setShowManageBooks(false)}
        onBooksChanged={(updated, newActiveId) => {
          setBooks(updated);
          if (newActiveId) {
            setActiveBook(newActiveId);
          }
        }}
      />

      {/* Receipt Fullscreen Photo Modal */}
      <NativePhotoModal
        uri={viewPhotoUri}
        onClose={() => setViewPhotoUri(null)}
      />
    </SafeAreaView>
  </View>
);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
