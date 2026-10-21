import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Linking,
  Share,
  Alert,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppleHaptic } from '../haptics';
import { bookById } from '../books';
import { longDate, monthLabel, rupiah, shortDate, todayISO, whatsappText } from '../money';
import { PrintIcon, ShareIcon, WhatsAppIcon } from './SvgIcons';
import type { BookId, MonthReport } from '../types';

interface Props {
  visible: boolean;
  bookId: BookId;
  report: MonthReport;
  onClose: () => void;
}

export function NativeReportModal({ visible, bookId, report, onClose }: Props) {
  const book = bookById(bookId);
  const [printing, setPrinting] = useState(false);
  const textWA = whatsappText(book.name, report);

  const translateY = useRef(new Animated.Value(0)).current;

  // Reset translateY whenever modal opens
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

  const handleOpenWhatsApp = async () => {
    AppleHaptic.actionMedium();
    const url = `whatsapp://send?text=${encodeURIComponent(textWA)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      const webUrl = `https://wa.me/?text=${encodeURIComponent(textWA)}`;
      await Linking.openURL(webUrl).catch(() => {
        Share.share({ message: textWA });
      });
    }
  };

  const handleShareText = async () => {
    AppleHaptic.chipTap();
    await Share.share({
      title: `Laporan ${book.name} ${monthLabel(report.month)}`,
      message: textWA,
    });
  };

  const handlePrintPdf = async () => {
    AppleHaptic.actionMedium();
    setPrinting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { margin: 0; font-size: 22px; color: #0f172a; }
            .sub { color: #64748b; font-size: 14px; margin-top: 4px; margin-bottom: 24px; }
            .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
            .sum-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
            .sum-total { border-top: 2px solid #cbd5e1; margin-top: 8px; padding-top: 8px; font-weight: bold; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            .right { text-align: right; }
            .green { color: #10b981; font-weight: 600; }
            .red { color: #ef4444; font-weight: 600; }
            .sign { margin-top: 40px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Laporan ${book.name}</h1>
          <div class="sub">Periode Bulan: ${monthLabel(report.month)}</div>

          <div class="summary-box">
            <div class="sum-row"><span>Saldo Bulan Lalu:</span> <b>${rupiah(report.opening)}</b></div>
            <div class="sum-row"><span class="green">Total Uang Masuk:</span> <b class="green">+${rupiah(report.income)}</b></div>
            <div class="sum-row"><span class="red">Total Uang Keluar:</span> <b class="red">−${rupiah(report.expense)}</b></div>
            <div class="sum-row sum-total"><span>Sisa Saldo Kas:</span> <b>${rupiah(report.closing)}</b></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 80px;">Tanggal</th>
                <th>Keterangan</th>
                <th class="right" style="width: 100px;">Masuk</th>
                <th class="right" style="width: 100px;">Keluar</th>
              </tr>
            </thead>
            <tbody>
              ${
                report.items.length === 0
                  ? '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Tidak ada transaksi</td></tr>'
                  : report.items
                      .map(
                        (t, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${shortDate(t.date)}</td>
                      <td><b>${t.category}</b>${t.note ? `<br><small style="color: #64748b;">${t.note}</small>` : ''}</td>
                      <td class="right green">${t.type === 'in' ? rupiah(t.amount) : ''}</td>
                      <td class="right red">${t.type === 'out' ? rupiah(t.amount) : ''}</td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>

          <div class="sign">
            <p>${longDate(todayISO())}</p>
            <p style="margin-top: 4px;">Bendahara,</p>
            <p style="margin-top: 60px;">(........................................)</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Laporan ${book.name} ${report.month}`,
      });
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setPrinting(false);
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
            <Text style={styles.titleText}>Laporan {book.name}</Text>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.periodBox}>
              <Text style={styles.periodSub}>Periode Pembukuan</Text>
              <Text style={styles.periodMain}>{monthLabel(report.month)}</Text>
            </View>

            {/* Financial Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Saldo bulan lalu</Text>
                <Text style={styles.sumVal}>{rupiah(report.opening)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Total uang masuk</Text>
                <Text style={[styles.sumVal, { color: '#10B981', fontWeight: '700' }]}>
                  +{rupiah(report.income)}
                </Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Total uang keluar</Text>
                <Text style={[styles.sumVal, { color: '#EF4444', fontWeight: '700' }]}>
                  −{rupiah(report.expense)}
                </Text>
              </View>
              <View style={[styles.sumRow, styles.sumClosingRow]}>
                <Text style={styles.sumClosingLabel}>Sisa saldo kas</Text>
                <Text style={styles.sumClosingVal}>{rupiah(report.closing)}</Text>
              </View>
            </View>

            {/* WhatsApp Buttons */}
            <Text style={styles.sectionTitle}>Bagikan ke Grup WhatsApp</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.waBtn]}
                onPress={handleOpenWhatsApp}
                activeOpacity={0.8}
              >
                <WhatsAppIcon size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.waBtnText}>Kirim ke WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.shareBtn]}
                onPress={handleShareText}
                activeOpacity={0.8}
              >
                <ShareIcon size={18} color="#0F172A" strokeWidth={2} />
                <Text style={styles.shareBtnText}>Salin / Bagi</Text>
              </TouchableOpacity>
            </View>

            {/* PDF Generation */}
            <Text style={styles.sectionTitle}>Dokumen Cetak / Arsip PDF</Text>
            <TouchableOpacity
              style={styles.pdfBtn}
              onPress={handlePrintPdf}
              disabled={printing}
              activeOpacity={0.8}
            >
              <PrintIcon size={20} color="#0284C7" strokeWidth={2} />
              <Text style={styles.pdfBtnText}>
                {printing ? 'Membuat PDF...' : 'Unduh / Cetak Laporan PDF'}
              </Text>
            </TouchableOpacity>
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
  periodBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSub: {
    fontSize: 13,
    color: '#64748B',
  },
  periodMain: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 24,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  sumLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  sumVal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  sumClosingRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  sumClosingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sumClosingVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums' as const] },
      android: {},
    }),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
  },
  waBtn: {
    flex: 1.3,
    backgroundColor: '#25D366',
  },
  waBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
    borderRadius: 26,
    height: 54,
    gap: 8,
  },
  pdfBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0284C7',
  },
});
