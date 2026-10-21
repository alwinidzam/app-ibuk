import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  defaultCategoriesForNewBook,
  saveStoredBooks,
} from '../books';
import { deleteTransactionsByBook } from '../storage';
import {
  BookSvgIcon,
  CheckCircleIcon,
  CloseIcon,
  PenToolIcon,
  PlusIcon,
  TrashIcon,
} from './SvgIcons';
import type { Book, BookId, Tx } from '../types';

interface Props {
  visible: boolean;
  books: Book[];
  activeBookId: BookId;
  transactions: Tx[];
  onClose: () => void;
  onBooksChanged: (updatedBooks: Book[], newActiveId?: BookId) => void;
}

const AVAILABLE_ICONS = [
  { id: 'school', label: 'Sekolah' },
  { id: 'mother', label: 'Ibu-Ibu' },
  { id: 'home', label: 'Rumah' },
  { id: 'building', label: 'Masjid/Gedung' },
  { id: 'store', label: 'Toko/Usaha' },
  { id: 'heart', label: 'Sosial/Infaq' },
  { id: 'star', label: 'Proyek' },
  { id: 'tag', label: 'Umum' },
];

const AVAILABLE_COLORS = [
  '#0A84FF', // Apple Blue
  '#AF52DE', // Apple Purple
  '#34C759', // Apple Green
  '#FF9500', // Apple Orange
  '#FF3B30', // Apple Red
  '#30B0C7', // Apple Teal
  '#F59E0B', // Amber
];

export function NativeManageBooksModal({
  visible,
  books,
  activeBookId,
  transactions,
  onClose,
  onBooksChanged,
}: Props) {
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  // PanResponder for Interactive Drag-Down to Dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        } else {
          translateY.setValue(gesture.dy * 0.2);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || (gesture.dy > 30 && gesture.vy > 0.5)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.timing(translateY, {
            toValue: 700,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 360,
            friction: 28,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Form states
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('building');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);

  const startAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBookId(null);
    setName('');
    setShort('');
    setSelectedIcon('building');
    setSelectedColor(
      AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]
    );
    setIsFormOpen(true);
  };

  const startEdit = (book: Book) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBookId(book.id);
    setName(book.name);
    setShort(book.short);
    setSelectedIcon(book.icon || 'tag');
    setSelectedColor(book.accentColor || AVAILABLE_COLORS[0]);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFormOpen(false);
    setEditingBookId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Mohon isi nama buku kas.');
      return;
    }

    const shortLabel = short.trim() || name.trim().slice(0, 10);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (editingBookId) {
      // Update existing book
      const updated = books.map((b) =>
        b.id === editingBookId
          ? {
              ...b,
              name: name.trim(),
              short: shortLabel,
              icon: selectedIcon,
              accentColor: selectedColor,
            }
          : b
      );
      await saveStoredBooks(updated);
      onBooksChanged(updated);
    } else {
      // Create new unique ID
      const baseSlug =
        shortLabel.toLowerCase().replace(/[^a-z0-9]/g, '') || 'buku';
      const uniqueId = `${baseSlug}_${Date.now().toString(36)}`;

      const newBook: Book = {
        id: uniqueId,
        short: shortLabel,
        name: name.trim(),
        icon: selectedIcon,
        accentColor: selectedColor,
        accentBg: `${selectedColor}15`,
        categories: defaultCategoriesForNewBook(),
      };

      const updated = [...books, newBook];
      await saveStoredBooks(updated);
      onBooksChanged(updated, newBook.id);
    }

    setIsFormOpen(false);
    setEditingBookId(null);
  };

  const handleDelete = (book: Book) => {
    if (books.length <= 1) {
      Alert.alert(
        'Perhatian',
        'Tidak dapat menghapus. Minimal harus ada 1 buku kas aktif.'
      );
      return;
    }

    const txCount = transactions.filter((t) => t.book === book.id).length;
    const msg =
      txCount > 0
        ? `Buku "${book.name}" memiliki ${txCount} catatan transaksi. Yakin ingin menghapus buku ini beserta seluruh catatannya?`
        : `Yakin ingin menghapus buku "${book.name}"?`;

    Alert.alert('Hapus Buku Kas?', msg, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (txCount > 0) {
            await deleteTransactionsByBook(book.id);
          }
          const updated = books.filter((b) => b.id !== book.id);
          const nextActive =
            activeBookId === book.id ? updated[0].id : activeBookId;
          await saveStoredBooks(updated);
          onBooksChanged(updated, nextActive);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          <Animated.View style={{ transform: [{ translateY }] }}>
            {/* Apple Drag Handle & Header - Swipe Down to Dismiss */}
            <View {...panResponder.panHandlers} style={styles.topDragArea}>
              <View style={styles.dragPill} />
              <Text style={styles.title}>Kelola Buku Kas</Text>
              <Text style={styles.subtitle}>
                Tambah, ubah, atau hapus pos pembukuan ibuk
              </Text>
            </View>

            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
            {/* List of Active Books */}
            <Text style={styles.sectionTitle}>BUKU KAS AKTIF</Text>
            <View style={styles.bookList}>
              {books.map((b) => {
                const isActive = b.id === activeBookId;
                const txCount = transactions.filter(
                  (t) => t.book === b.id
                ).length;
                return (
                  <View key={b.id} style={styles.bookRow}>
                    <View
                      style={[
                        styles.iconAvatar,
                        {
                          backgroundColor: `${b.accentColor || '#0A84FF'}1A`,
                        },
                      ]}
                    >
                      <BookSvgIcon
                        icon={b.icon || b.id}
                        size={20}
                        color={b.accentColor || '#0A84FF'}
                        strokeWidth={2.2}
                      />
                    </View>

                    <View style={styles.bookMeta}>
                      <View style={styles.titleRow}>
                        <Text style={styles.bookName} numberOfLines={1}>
                          {b.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>Dipilih</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.bookInfo}>
                        Tab: {b.short} • {txCount} catatan
                      </Text>
                    </View>

                    <View style={styles.actionsGroup}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => startEdit(b)}
                        accessibilityLabel={`Ubah ${b.name}`}
                      >
                        <PenToolIcon size={16} color="#0A84FF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtn]}
                        onPress={() => handleDelete(b)}
                        accessibilityLabel={`Hapus ${b.name}`}
                      >
                        <TrashIcon size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Add / Edit Form */}
            {isFormOpen ? (
              <View style={styles.formCard}>
                <Text style={styles.formHeader}>
                  {editingBookId ? 'Ubah Buku Kas' : 'Tambah Buku Kas Baru'}
                </Text>

                {/* Book Name */}
                <Text style={styles.fieldLabel}>Nama Buku Kas</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: Kas Masjid Al-Ikhlas"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />

                {/* Short Label */}
                <Text style={styles.fieldLabel}>Nama Singkat di Tab (Maks 10 huruf)</Text>
                <TextInput
                  style={styles.textInput}
                  value={short}
                  onChangeText={setShort}
                  maxLength={10}
                  placeholder="Contoh: Masjid"
                  placeholderTextColor="#94A3B8"
                />

                {/* Icon Picker */}
                <Text style={styles.fieldLabel}>Pilih Ikon (Pure SVG)</Text>
                <View style={styles.iconGrid}>
                  {AVAILABLE_ICONS.map((ic) => {
                    const isSelected = selectedIcon === ic.id;
                    return (
                      <TouchableOpacity
                        key={ic.id}
                        style={[
                          styles.iconPickItem,
                          isSelected && styles.iconPickItemSelected,
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedIcon(ic.id);
                        }}
                      >
                        <BookSvgIcon
                          icon={ic.id}
                          size={18}
                          color={isSelected ? '#0A84FF' : '#64748B'}
                          strokeWidth={isSelected ? 2.3 : 1.8}
                        />
                        <Text
                          style={[
                            styles.iconPickLabel,
                            isSelected && styles.iconPickLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {ic.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Color Picker */}
                <Text style={styles.fieldLabel}>Warna Tema</Text>
                <View style={styles.colorRow}>
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = selectedColor === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: c },
                          isSelected && styles.colorCircleSelected,
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedColor(c);
                        }}
                      >
                        {isSelected && (
                          <CheckCircleIcon size={16} color="#FFFFFF" strokeWidth={2.6} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Form Buttons */}
                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCancelForm}
                  >
                    <Text style={styles.cancelBtnText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: selectedColor }]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveBtnText}>
                      {editingBookId ? 'Simpan Perubahan' : 'Tambahkan Buku'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={startAdd}
                activeOpacity={0.8}
              >
                <PlusIcon size={18} color="#0A84FF" strokeWidth={2.4} />
                <Text style={styles.addNewButtonText}>
                  + Tambah Buku Kas Baru
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  topDragArea: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  dragPill: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  bookList: {
    gap: 10,
    marginBottom: 20,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  bookInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A84FF',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10, 132, 255, 0.04)',
    gap: 8,
  },
  addNewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A84FF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconPickItemSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0A84FF',
  },
  iconPickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  iconPickLabelSelected: {
    color: '#0A84FF',
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
