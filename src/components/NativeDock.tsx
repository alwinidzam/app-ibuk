import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AppleHaptic } from '../haptics';
import { ArrowDownIcon, ArrowUpIcon, DocumentTextIcon } from './SvgIcons';
import type { TxType } from '../types';

interface Props {
  onOpenCreate: (type: TxType) => void;
  onOpenReport: () => void;
}

function DockButton({
  onPress,
  style,
  flexWeight = 1,
  children,
  hapticType = 'medium',
}: {
  onPress: () => void;
  style: any;
  flexWeight?: number;
  children: React.ReactNode;
  hapticType?: 'medium' | 'light';
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      tension: 400,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 360,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ flex: flexWeight, transform: [{ scale }] }}>
      <TouchableOpacity
        style={style}
        onPress={() => {
          if (hapticType === 'medium') {
            AppleHaptic.actionMedium();
          } else {
            AppleHaptic.chipTap();
          }
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function NativeDock({ onOpenCreate, onOpenReport }: Props) {
  return (
    <View style={styles.dockContainer} pointerEvents="box-none">
      <View style={styles.dock}>
        {/* Kas Masuk (Income) */}
        <DockButton
          style={[styles.btn, styles.incomeBtn]}
          flexWeight={1}
          onPress={() => onOpenCreate('in')}
          hapticType="medium"
        >
          <ArrowDownIcon size={18} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.btnTextWhite}>Masuk</Text>
        </DockButton>

        {/* Kas Keluar (Expense) */}
        <DockButton
          style={[styles.btn, styles.expenseBtn]}
          flexWeight={1}
          onPress={() => onOpenCreate('out')}
          hapticType="medium"
        >
          <ArrowUpIcon size={18} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.btnTextWhite}>Keluar</Text>
        </DockButton>

        {/* Laporan (Report) */}
        <DockButton
          style={[styles.btn, styles.reportBtn]}
          flexWeight={0.9}
          onPress={onOpenReport}
          hapticType="light"
        >
          <DocumentTextIcon size={18} color="#0F172A" strokeWidth={2} />
          <Text style={styles.btnTextDark}>Laporan</Text>
        </DockButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 28,
    padding: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    maxWidth: 400,
    width: '100%',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 22,
    gap: 6,
    width: '100%',
  },
  incomeBtn: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  expenseBtn: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  reportBtn: {
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  btnTextWhite: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnTextDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
