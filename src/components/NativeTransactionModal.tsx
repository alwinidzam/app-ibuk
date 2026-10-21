import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { bookById } from '../books';
import { parseAmount, rupiah, todayISO } from '../money';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CameraIcon,
  CategorySvgIcon,
  TrashIcon,
} from './SvgIcons';
import type { BookId, Tx, TxType } from '../types';

interface Props {
  visible: boolean;
  bookId: BookId;
  initialType: TxType;
  txToEdit?: Tx | null;
  onClose: () => void;
  onSave: (tx: Tx) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function NativeTransactionModal({
  visible,
  bookId,
  initialType,
  txToEdit,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const book = bookById(bookId);
  const [type, setType] = useState<TxType>(txToEdit ? txToEdit.type : initialType);
  const [amount, setAmount] = useState<number>(txToEdit ? txToEdit.amount : 0);
  const [amountStr, setAmountStr] = useState<string>(txToEdit ? String(txToEdit.amount) : '');
  const [category, setCategory] = useState<string>(
    txToEdit ? txToEdit.category : book.categories[type][0]?.name || 'Lainnya'
  );
  const [note, setNote] = useState<string>(txToEdit ? txToEdit.note : '');
  const [date, setDate] = useState<string>(txToEdit ? txToEdit.date : todayISO());
  const [photoUri, setPhotoUri] = useState<string | undefined>(txToEdit?.photoUri);
  const [saving, setSaving] = useState(false);

  // Animations
  const translateY = useRef(new Animated.Value(0)).current;
  const amountScale = useRef(new Animated.Value(1)).current;

  // Punch amount animation on change
  const punchAmount = () => {
    amountScale.setValue(1.08);
    Animated.spring(amountScale, {
      toValue: 1,
      tension: 380,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const categories = book.categories[type];

  // PanResponder for Interactive Drag-Down to Dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          // Free downward drag
          translateY.setValue(gesture.dy);
        } else {
          // Elastic rubber-banding when dragged upward
          translateY.setValue(gesture.dy * 0.2);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || (gesture.dy > 30 && gesture.vy > 0.5)) {
          // Smooth dismissal
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
          // Snap back with Apple spring
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

  const handleAddNominal = (add: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = amount + add;
    setAmount(next);
    setAmountStr(String(next));
    punchAmount();
  };

  const handleAmountChange = (text: string) => {
    const num = parseAmount(text);
    setAmount(num);
    setAmountStr(num > 0 ? String(num) : '');
    punchAmount();
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Ambil Foto Bukti Nota', 'Pilih sumber foto:', [
      {
        text: 'Kamera HP',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Perlu izin kamera untuk mengambil foto nota.');
            return;
          }
          const res = await ImagePicker.launchCameraAsync({
            quality: 0.6,
            allowsEditing: true,
          });
          if (!res.canceled && res.assets[0]) {
            setPhotoUri(res.assets[0].uri);
          }
        },
      },
      {
        text: 'Galeri Foto',
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            quality: 0.6,
            allowsEditing: true,
          });
          if (!res.canceled && res.assets[0]) {
            setPhotoUri(res.assets[0].uri);
          }
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Mohon masukkan nominal uang.');
      return;
    }
    setSaving(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const tx: Tx = {
        id: txToEdit ? txToEdit.id : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        book: bookId,
        type,
        amount,
        category,
        note: note.trim(),
        date,
        photoUri,
        createdAt: txToEdit ? txToEdit.createdAt : Date.now(),
      };
      await onSave(tx);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!txToEdit?.id || !onDelete) return;
    Alert.alert('Hapus Catatan', 'Yakin ingin menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await onDelete(txToEdit.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetInner,
            { transform: [{ translateY }] },
          ]}
        >
          {/* iOS Grabber & Drag Zone (Swipe Down to Dismiss) */}
          <View {...panResponder.panHandlers} style={styles.topDragArea}>
            <View style={styles.grabber} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.titleText}>
                {txToEdit ? 'Ubah Catatan' : type === 'in' ? 'Catat Uang Masuk' : 'Catat Uang Keluar'}
              </Text>
              {txToEdit && onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <TrashIcon size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Type Switcher */}
            {!txToEdit && (
              <View style={styles.switcherContainer}>
                <TouchableOpacity
                  style={[styles.switcherBtn, type === 'in' && styles.switcherBtnIn]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setType('in');
                    setCategory(book.categories.in[0]?.name || 'Lainnya');
                  }}
                  activeOpacity={0.8}
                >
                  <ArrowDownIcon size={16} color={type === 'in' ? '#10B981' : '#64748B'} strokeWidth={2.4} />
                  <Text style={[styles.switcherText, type === 'in' && styles.switcherTextActive]}>
                    Uang Masuk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.switcherBtn, type === 'out' && styles.switcherBtnOut]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setType('out');
                    setCategory(book.categories.out[0]?.name || 'Lainnya');
                  }}
                  activeOpacity={0.8}
                >
                  <ArrowUpIcon size={16} color={type === 'out' ? '#EF4444' : '#64748B'} strokeWidth={2.4} />
                  <Text style={[styles.switcherText, type === 'out' && styles.switcherTextActive]}>
                    Uang Keluar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Big Amount Display Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>
                Jumlah Uang ({type === 'in' ? 'Masuk' : 'Keluar'})
              </Text>
              <Animated.Text
                style={[
                  styles.amountHero,
                  { color: type === 'in' ? '#10B981' : '#EF4444' },
                  { transform: [{ scale: amountScale }] },
                ]}
              >
                {amount > 0 ? rupiah(amount) : 'Rp 0'}
              </Animated.Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="Ketik angka..."
                placeholderTextColor="#94A3B8"
                value={amountStr ? rupiah(parseAmount(amountStr)) : ''}
                onChangeText={handleAmountChange}
              />
            </View>

            {/* Quick Chips with Tactile Bounce */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {[10_000, 20_000, 50_000, 100_000, 500_000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.chip}
                  onPress={() => handleAddNominal(val)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>+{val / 1000} rb</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAmount(0);
                  setAmountStr('');
                  punchAmount();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: '#EF4444' }]}>Hapus</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Category Grid (Pure SVG) */}
            <Text style={styles.sectionTitle}>Pilih Kategori</Text>
            <View style={styles.categoryGrid}>
              {categories.map((c) => {
                const isActive = category === c.name;
                const tileColor = isActive
                  ? type === 'in'
                    ? '#10B981'
                    : '#EF4444'
                  : '#64748B';
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[styles.categoryTile, isActive && styles.categoryTileActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCategory(c.name);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryIconWrap,
                        isActive && { backgroundColor: type === 'in' ? '#ECFDF5' : '#FEF2F2' },
                      ]}
                    >
                      <CategorySvgIcon name={c.name} size={22} color={tileColor} />
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        isActive && { color: tileColor, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Input */}
            <Text style={styles.sectionTitle}>Keterangan (Opsional)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Contoh: Iuran kas bulan Oktober, beli spidol..."
              placeholderTextColor="#94A3B8"
              value={note}
              onChangeText={setNote}
            />

            {/* Date Input */}
            <Text style={styles.sectionTitle}>Tanggal (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="2026-10-21"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
            />

            {/* Receipt Photo Box */}
            <Text style={styles.sectionTitle}>Foto Bukti Nota / Kwitansi</Text>
            <TouchableOpacity style={styles.photoBox} onPress={handlePickImage} activeOpacity={0.8}>
              {photoUri ? (
                <View style={{ alignItems: 'center' }}>
                  <Image source={{ uri: photoUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setPhotoUri(undefined);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <TrashIcon size={16} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>
                      Hapus Foto
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <CameraIcon size={32} color="#0284C7" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B' }}>
                    Ketuk untuk Ambil Foto / Pilih dari Galeri
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Primary Save Button (Senior Friendly 54pt Height) */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: type === 'in' ? '#10B981' : '#EF4444' },
                amount <= 0 && { opacity: 0.4 },
              ]}
              disabled={saving || amount <= 0}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'SIMPAN CATATAN'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetInner: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  topDragArea: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D1D6',
    marginBottom: 10,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 28,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    right: 0,
    padding: 6,
  },
  body: {
    padding: 20,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    padding: 4,
    marginBottom: 16,
    height: 52,
    alignItems: 'center',
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 18,
    gap: 7,
  },
  switcherBtnIn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  switcherBtnOut: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  switcherText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  switcherTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  amountLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  amountHero: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  amountInput: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  chipsRow: {
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  categoryTile: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 74,
    justifyContent: 'center',
  },
  categoryTileActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0284C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 16,
  },
  photoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 14,
    marginBottom: 8,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    minHeight: 44,
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
