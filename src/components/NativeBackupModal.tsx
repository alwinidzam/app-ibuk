import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Share,
  Animated,
  PanResponder,
} from 'react-native';
import { AppleHaptic } from '../haptics';
import { CheckCircleIcon, DocumentTextIcon, ShareIcon } from './SvgIcons';
import { exportBackup, importBackup } from '../storage';
import type { Tx } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onRestored: (txs: Tx[]) => void;
}

export function NativeBackupModal({ visible, onClose, onRestored }: Props) {
  const [busy, setBusy] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

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

  const handleExport = async () => {
    AppleHaptic.actionMedium();
    setBusy(true);
    try {
      const json = await exportBackup();
      await Share.share({
        title: 'Cadangan Buku Kas Ibuk',
        message: json,
      });
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat teks cadangan.');
    } finally {
      setBusy(false);
    }
  };

  const handleImportText = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Perhatian', 'Tempel teks cadangan JSON terlebih dahulu.');
      return;
    }
    setBusy(true);
    try {
      const restored = await importBackup(jsonInput);
      AppleHaptic.successSave();
      Alert.alert('Sukses', `Berhasil memulihkan ${restored.length} data transaksi!`);
      onRestored(restored);
      onClose();
    } catch (e) {
      AppleHaptic.warningDelete();
      Alert.alert('Gagal', (e as Error).message || 'Format teks cadangan tidak valid.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
            <Text style={styles.titleText}>Cadangkan Data</Text>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.infoBox}>
              <CheckCircleIcon size={24} color="#10B981" />
              <Text style={styles.infoText}>
                Semua catatan uang tersimpan <Text style={{ fontWeight: '700' }}>100% aman di dalam memori HP ibuk</Text> tanpa server internet.
              </Text>
            </View>

            {/* Export Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1. Simpan Cadangan (Share Backup)</Text>
              <Text style={styles.cardDesc}>
                Kirimkan data cadangan ke WhatsApp anak atau Google Drive untuk disimpan sebagai arsip aman jika suatu saat ganti HP.
              </Text>
              <TouchableOpacity
                style={styles.exportBtn}
                onPress={handleExport}
                disabled={busy}
                activeOpacity={0.8}
              >
                <ShareIcon size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.exportBtnText}>
                  {busy ? 'Memproses...' : 'Bagikan Data Cadangan'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Restore Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>2. Pulihkan Catatan dari Cadangan</Text>
              <Text style={styles.cardDesc}>
                Jika berganti HP, salin teks cadangan sebelumnya dan tempel di sini untuk mengembalikan seluruh catatan:
              </Text>

              {pasteMode ? (
                <View>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Tempel (Paste) teks JSON cadangan di sini..."
                    placeholderTextColor="#94A3B8"
                    value={jsonInput}
                    onChangeText={setJsonInput}
                  />
                  <TouchableOpacity
                    style={styles.importBtn}
                    onPress={handleImportText}
                    disabled={busy}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.importBtnText}>Pulihkan Sekarang</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.togglePasteBtn}
                  onPress={() => {
                    AppleHaptic.chipTap();
                    setPasteMode(true);
                  }}
                  activeOpacity={0.8}
                >
                  <DocumentTextIcon size={18} color="#0F172A" strokeWidth={2} />
                  <Text style={styles.togglePasteText}>Buka Kotak Pemulihan Data</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
  infoBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  infoText: {
    fontSize: 13,
    color: '#065F46',
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 26,
    height: 52,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  togglePasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 26,
    height: 52,
    gap: 8,
  },
  togglePasteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    padding: 12,
    height: 100,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  importBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
