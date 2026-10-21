import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { DEFAULT_BOOKS } from '../books';
import { longDate, todayISO } from '../money';
import { ArchiveIcon, BookSvgIcon, PlusIcon } from './SvgIcons';
import type { Book, BookId } from '../types';

interface Props {
  books?: Book[];
  activeBook: BookId;
  onSelectBook: (id: BookId) => void;
  onOpenBackup: () => void;
  onOpenManageBooks: () => void;
}

export function NativeHeader({
  books = DEFAULT_BOOKS,
  activeBook,
  onSelectBook,
  onOpenBackup,
  onOpenManageBooks,
}: Props) {
  const today = longDate(todayISO());

  const handleSelect = (id: BookId) => {
    if (id !== activeBook) {
      Haptics.selectionAsync();
      onSelectBook(id);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.dateText}>{today}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenBackup();
          }}
          activeOpacity={0.7}
          accessibilityLabel="Cadangkan dan Pulihkan Data"
        >
          <ArchiveIcon size={19} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Bar with Add Book Action */}
      <View style={styles.segmentedBarRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.segmentedContainer,
            books.length <= 3 && styles.segmentedContainerFill,
          ]}
          style={styles.segmentedScroll}
        >
          {books.map((b) => {
            const isActive = b.id === activeBook;
            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.segmentBtn,
                  isActive && styles.segmentBtnActive,
                  books.length <= 3 && styles.segmentBtnFlex,
                ]}
                onPress={() => handleSelect(b.id)}
                activeOpacity={0.8}
              >
                <BookSvgIcon
                  icon={b.icon || b.id}
                  size={16}
                  color={isActive ? '#0F172A' : '#64748B'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <Text
                  style={[
                    styles.segmentLabel,
                    isActive && styles.segmentLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {b.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.addBookBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenManageBooks();
          }}
          activeOpacity={0.7}
          accessibilityLabel="Kelola dan Tambah Buku Kas"
        >
          <PlusIcon size={18} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentedBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedScroll: {
    flex: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230, 230, 235, 0.85)',
    borderRadius: 14,
    padding: 3,
    alignItems: 'center',
    gap: 4,
  },
  segmentedContainerFill: {
    flex: 1,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 11,
    gap: 6,
  },
  segmentBtnFlex: {
    flex: 1,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  addBookBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
