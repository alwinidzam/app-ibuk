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

  // Animations
  const translateX = useRef(new Animated.Value(0)).current;
  const punchAnim = useRef(new Animated.Value(1)).current;

  // Punch animation whenever closing amount or book changes
  useEffect(() => {
    punchAnim.setValue(1.05);
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
        // Hysteresis deadzone: requires horizontal intent > 15px and 1.8x vertical
        return (
          Math.abs(gesture.dx) > 15 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8
        );
      },
      onPanResponderMove: (_, gesture) => {
        // Elastic rubber band when dragging
        const resisted = gesture.dx * 0.6;
        translateX.setValue(resisted);
      },
      onPanResponderRelease: (_, gesture) => {
        const dx = gesture.dx;
        const vx = gesture.vx;

        // Swipe Left -> Next Book
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

        // Swipe Right -> Prev Book
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

        // Snap back to 0 with Apple Critically Damped Spring
        Animated.spring(translateX, {
          toValue: 0,
          tension: 360,
          friction: 30,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Subtle parallax tilt during horizontal drag
  const rotateZ = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-2.5deg', '0deg', '2.5deg'],
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
            <View style={[styles.bookDot, { backgroundColor: book.accentColor }]} />
            <Text style={styles.bookTitle}>{book.name}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>SALDO BERJALAN</Text>
          </View>
        </View>

        {/* Hero Tabular Balance Display */}
        <View style={styles.balanceCenter}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <Text style={styles.balanceAmount}>
            {rupiah(report.closing).replace('Rp\u00A0', '').replace('Rp ', '')}
          </Text>
        </View>

        {/* Integrated Two-Column Metrics Bar (Radical Subtraction: No card-in-card!) */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <ArrowDownIcon size={13} color="#059669" strokeWidth={2} />
              <Text style={styles.metricLabel}>Uang Masuk</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#059669' }]}>
              +{rupiah(report.income)}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <ArrowUpIcon size={13} color="#DC2626" strokeWidth={2} />
              <Text style={styles.metricLabel}>Uang Keluar</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#DC2626' }]}>
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
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bookDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636366',
    letterSpacing: -0.2,
  },
  statusPill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  balanceCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 10,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: '#636366',
    letterSpacing: -0.5,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.8,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.12)',
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    paddingHorizontal: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636366',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  metricDivider: {
    width: 0.5,
    height: 26,
    backgroundColor: 'rgba(60, 60, 67, 0.12)',
    marginHorizontal: 8,
  },
});
