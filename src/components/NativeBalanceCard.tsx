import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { AppleHaptic } from '../haptics';
import { bookById } from '../books';
import { rupiah } from '../money';
import { ArrowDownIcon, ArrowUpIcon } from './SvgIcons';
import type { Book, BookId, MonthReport } from '../types';

interface Props {
  bookId: BookId;
  report: MonthReport;
  books?: Book[];
  onSwipeBook?: (direction: 'next' | 'prev') => void;
  onSelectBook?: (id: BookId) => void;
}

export function NativeBalanceCard({ bookId, report, books, onSwipeBook }: Props) {
  const book = bookById(bookId, books);

  const translateX = useRef(new Animated.Value(0)).current;
  const punchAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    punchAnim.setValue(1.04);
    Animated.spring(punchAnim, {
      toValue: 1,
      tension: 360,
      friction: 24,
      useNativeDriver: true,
    }).start();
  }, [report.closing, bookId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return (
          Math.abs(gesture.dx) > 15 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8
        );
      },
      onPanResponderMove: (_, gesture) => {
        const resisted = gesture.dx * 0.6;
        translateX.setValue(resisted);
      },
      onPanResponderRelease: (_, gesture) => {
        const dx = gesture.dx;
        const vx = gesture.vx;

        if ((dx < -50 || (dx < -20 && vx < -0.4)) && onSwipeBook) {
          AppleHaptic.bookSwitch();
          Animated.timing(translateX, {
            toValue: -80,
            duration: 90,
            useNativeDriver: true,
          }).start(() => {
            onSwipeBook('next');
            translateX.setValue(80);
            Animated.spring(translateX, {
              toValue: 0,
              tension: 340,
              friction: 28,
              useNativeDriver: true,
            }).start();
          });
          return;
        }

        if ((dx > 50 || (dx > 20 && vx > 0.4)) && onSwipeBook) {
          AppleHaptic.bookSwitch();
          Animated.timing(translateX, {
            toValue: 80,
            duration: 90,
            useNativeDriver: true,
          }).start(() => {
            onSwipeBook('prev');
            translateX.setValue(-80);
            Animated.spring(translateX, {
              toValue: 0,
              tension: 340,
              friction: 28,
              useNativeDriver: true,
            }).start();
          });
          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          tension: 360,
          friction: 30,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const rotateZ = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  return (
    <View style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX }, { rotateZ }, { scale: punchAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Passbook Header Row */}
        <View style={styles.topRow}>
          <View style={styles.bookTag}>
            <View
              style={[
                styles.bookDot,
                { backgroundColor: book.accentColor || '#0284C7' },
              ]}
            />
            <Text style={styles.bookTitle}>{book.name}</Text>
          </View>
          {/* Kontras Tinggi: Tidak washed-out lagi */}
          <View style={styles.statusPill}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.statusText}>SALDO KAS AKTIF</Text>
          </View>
        </View>

        {/* Hero Tabular Balance Display */}
        <View style={styles.balanceCenter}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <Text style={styles.balanceAmount}>
            {rupiah(report.closing).replace('Rp\u00A0', '').replace('Rp ', '')}
          </Text>
        </View>

        {/* Split Metric Symmetrical Tiles */}
        <View style={styles.metricsContainer}>
          {/* Uang Masuk Tile */}
          <View style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconBubble, styles.metricIconIn]}>
                <ArrowDownIcon size={12} color="#059669" strokeWidth={2.5} />
              </View>
              <Text style={styles.metricLabel}>Uang Masuk</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#059669' }]}>
              +{rupiah(report.income)}
            </Text>
          </View>

          {/* Hairline Divider */}
          <View style={styles.metricTileDivider} />

          {/* Uang Keluar Tile */}
          <View style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconBubble, styles.metricIconOut]}>
                <ArrowUpIcon size={12} color="#E11D48" strokeWidth={2.5} />
              </View>
              <Text style={styles.metricLabel}>Uang Keluar</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#E11D48' }]}>
              −{rupiah(report.expense)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  bookTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.5,
  },
  balanceCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 5,
    marginVertical: 12,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: -0.5,
  },
  balanceAmount: {
    fontSize: 39,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginTop: 6,
  },
  metricTile: {
    flex: 1,
    paddingHorizontal: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricIconIn: {
    backgroundColor: '#ECFDF5',
  },
  metricIconOut: {
    backgroundColor: '#FEF2F2',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricVal: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.3,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  metricTileDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(60, 60, 67, 0.10)',
    marginHorizontal: 4,
  },
});
