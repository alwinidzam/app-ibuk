import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Linking,
  Share,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppleHaptic } from '../haptics';
import { bookById } from '../books';
import { longDate, rupiah } from '../money';
import {
  CategorySvgIcon,
  ImageIcon,
  PenToolIcon,
  ShareIcon,
  TrashIcon,
  WhatsAppIcon,
} from './SvgIcons';
import type { Tx } from '../types';

interface Props {
  visible: boolean;
  tx: Tx | null;
  onClose: () => void;
  onEdit: (tx: Tx) => void;
  onDelete: (id: string) => Promise<void> | void;
  onViewPhoto: (uri: string) => void;
}

export function NativeTransactionDetailModal({
  visible,
  tx,
  onClose,
  onEdit,
  onDelete,
  onViewPhoto,
}: Props) {
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
          AppleHaptic.chipTap();
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

  if (!tx) return null;

  const book = bookById(tx.book);
  const isIncome = tx.type === 'in';
  const themeColor = isIncome ? '#059669' : '#DC2626';

  const handleShareWhatsApp = async () => {
    AppleHaptic.actionMedium();
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const text = `*BUKTI CATATAN KAS IBUK*\n` +
      `Buku: ${book.name}\n` +
      `---------------------------\n` +
      `Kategori: ${tx.category}\n` +
      `Tipe: ${typeLabel}\n` +
      `Nominal: ${isIncome ? '+' : '−'}${rupiah(tx.amount)}\n` +
      `Tanggal: ${longDate(tx.date)}\n` +
      (tx.note ? `Keterangan: ${tx.note}\n` : '') +
      `---------------------------\n` +
      `_Tercatat aman di aplikasi Buku Kas Ibuk_`;

    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Share.share({ message: text });
    }
  };

  const confirmDelete = () => {
    AppleHaptic.warningDelete();
    Alert.alert(
      'Hapus Catatan Kas Ini?',
      `Yakin ingin menghapus catatan "${tx.category}" sebesar ${rupiah(tx.amount)}? Data ini akan dihapus dari buku kas. Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Catatan',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await onDelete(tx.id);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
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
            <Text style={styles.titleText}>Rincian Catatan Kas</Text>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 36 }}>
            {/* Hero Card */}
            <View style={styles.heroBox}>
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: isIncome ? '#ECFDF5' : '#FEF2F2' },
                ]}
              >
                <CategorySvgIcon name={tx.category} size={28} color={themeColor} />
              </View>

              <Text style={styles.categoryName}>{tx.category}</Text>
              <View style={styles.bookBadge}>
                <Text style={styles.bookBadgeText}>{book.name}</Text>
              </View>

              <Text style={[styles.amountText, { color: themeColor }]}>
                {isIncome ? '+' : '−'}{rupiah(tx.amount)}
              </Text>
              <Text style={styles.typeSub}>
                {isIncome ? 'Uang Masuk Kas' : 'Uang Keluar Kas'}
              </Text>
            </View>

            {/* Inset Grouped Detail Card */}
            <Text style={styles.sectionTitle}>INFORMASI LENGKAP</Text>
            <View style={styles.detailCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal</Text>
                <Text style={styles.infoValue}>{longDate(tx.date)}</Text>
              </View>
              <View style={styles.hairline} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kategori</Text>
                <Text style={styles.infoValue}>{tx.category}</Text>
              </View>
              <View style={styles.hairline} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipe Transaksi</Text>
                <Text style={[styles.infoValue, { color: themeColor, fontWeight: '700' }]}>
                  {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>

              {tx.note ? (
                <>
                  <View style={styles.hairline} />
                  <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                    <Text style={styles.infoLabel}>Keterangan / Catatan</Text>
                    <Text style={styles.noteFullText}>{tx.note}</Text>
                  </View>
                </>
              ) : null}
            </View>

            {/* Receipt Photo Card if Attached */}
            {tx.photoUri ? (
              <>
                <Text style={styles.sectionTitle}>BUKTI NOTA / KWITANSI</Text>
                <TouchableOpacity
                  style={styles.photoCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onViewPhoto(tx.photoUri!);
                  }}
                >
                  <Image source={{ uri: tx.photoUri }} style={styles.photoThumb} />
                  <View style={styles.photoInfo}>
                    <View style={styles.photoBadgeRow}>
                      <ImageIcon size={14} color="#0284C7" />
                      <Text style={styles.photoBadgeTitle}>Nota Tersimpan</Text>
                    </View>
                    <Text style={styles.photoHint}>Ketuk untuk melihat foto ukuran penuh</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : null}

            {/* Action Buttons Section */}
            <Text style={styles.sectionTitle}>AKSI CATATAN</Text>
            <View style={styles.actionColumn}>
              {/* Edit Button */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                activeOpacity={0.8}
                onPress={() => {
                  AppleHaptic.chipTap();
                  onClose();
                  onEdit(tx);
                }}
              >
                <PenToolIcon size={18} color="#0A84FF" />
                <Text style={styles.editBtnText}>Ubah Rincian Catatan</Text>
              </TouchableOpacity>

              {/* Share to WhatsApp Button */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.waBtn]}
                activeOpacity={0.8}
                onPress={handleShareWhatsApp}
              >
                <WhatsAppIcon size={18} color="#25D366" />
                <Text style={styles.waBtnText}>Bagikan Bukti ke WhatsApp</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                activeOpacity={0.8}
                onPress={confirmDelete}
              >
                <TrashIcon size={18} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Hapus Catatan Ini</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
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
    maxHeight: '90%',
  },
  topDragArea: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 14,
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
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  body: {
    padding: 20,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconBubble: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bookBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  typeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  noteFullText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    marginTop: 2,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
    marginBottom: 18,
    gap: 12,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
  },
  photoInfo: {
    flex: 1,
  },
  photoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  photoBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  photoHint: {
    fontSize: 11,
    color: '#64748B',
  },
  actionColumn: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A84FF',
  },
  waBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
  },
  waBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
