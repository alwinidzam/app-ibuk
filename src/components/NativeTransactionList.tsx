import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { dayLabel, monthLabel, rupiah, shiftMonth } from '../money';
import {
  CategorySvgIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ImageIcon,
  InfoIcon,
} from './SvgIcons';
import type { BookId, Tx } from '../types';

interface Props {
  bookId: BookId;
  month: string;
  transactions: Tx[];
  onSelectMonth: (m: string) => void;
  onSelectTx: (t: Tx) => void;
  onViewPhoto: (uri: string) => void;
}

export function NativeTransactionList({
  bookId,
  month,
  transactions,
  onSelectMonth,
  onSelectTx,
  onViewPhoto,
}: Props) {
  // Filter transactions
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
    <View style={styles.container}>
      {/* Apple Journal Unified Month Capsule */}
      <View style={styles.monthCapsuleWrapper}>
        <View style={styles.monthCapsule}>
          <TouchableOpacity
            style={styles.monthArrowBtn}
            hitSlop={{ top: 10, bottom: 10, left: 14, right: 8 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectMonth(shiftMonth(month, -1));
            }}
            accessibilityLabel="Bulan Sebelumnya"
            activeOpacity={0.6}
          >
            <ChevronLeftIcon size={16} color="#334155" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.monthLabelCenter}>
            <Text style={styles.monthTitle}>{monthLabel(month)}</Text>
          </View>

          <TouchableOpacity
            style={styles.monthArrowBtn}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 14 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectMonth(shiftMonth(month, 1));
            }}
            accessibilityLabel="Bulan Berikutnya"
            activeOpacity={0.6}
          >
            <ChevronRightIcon size={16} color="#334155" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Hint Pill */}
      {dates.length > 0 && (
        <View style={styles.hintContainer}>
          <View style={styles.hintPill}>
            <InfoIcon size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.hintText}>
              Tips: Ketuk transaksi untuk melihat detail, ubah, atau hapus
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {dates.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <DocumentTextIcon size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
          <Text style={styles.emptySub}>
            Ketuk tombol hijau atau merah di bawah untuk mencatat kas masuk atau keluar.
          </Text>
        </View>
      ) : (
        dates.map((d) => (
          <View key={d} style={styles.dateGroup}>
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeader}>{dayLabel(d)}</Text>
              <Text style={styles.dateBadge}>{grouped[d].length} transaksi</Text>
            </View>

            <View style={styles.cardList}>
              {grouped[d].map((t, idx) => {
                const isLast = idx === grouped[d].length - 1;
                const iconColor = t.type === 'in' ? '#10B981' : '#EF4444';

                return (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.row}
                    activeOpacity={0.65}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSelectTx(t);
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <View
                        style={[
                          styles.iconBubble,
                          { backgroundColor: t.type === 'in' ? '#ECFDF5' : '#FEF2F2' },
                        ]}
                      >
                        <CategorySvgIcon name={t.category} size={20} color={iconColor} />
                      </View>
                      <View style={styles.textContainer}>
                        <View style={styles.categoryRow}>
                          <Text style={styles.categoryName}>{t.category}</Text>
                          {t.photoUri && (
                            <View style={styles.photoBadge}>
                              <ImageIcon size={12} color="#0284C7" />
                              <Text style={styles.photoBadgeText}>Nota</Text>
                            </View>
                          )}
                        </View>
                        {t.note ? <Text style={styles.noteText}>{t.note}</Text> : null}
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.amountText,
                        { color: t.type === 'in' ? '#059669' : '#1F2937' },
                      ]}
                    >
                      {t.type === 'in' ? '+' : '−'}
                      {rupiah(t.amount)}
                    </Text>

                    {!isLast && <View style={styles.hairlineSeparator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  monthCapsuleWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  monthCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabelCenter: {
    paddingHorizontal: 14,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  dateGroup: {
    marginBottom: 18,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  dateBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  cardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    position: 'relative',
  },
  hairlineSeparator: {
    position: 'absolute',
    bottom: 0,
    left: 72,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60, 60, 67, 0.12)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 12,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  photoBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
