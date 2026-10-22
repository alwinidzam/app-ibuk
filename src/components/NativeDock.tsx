import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
      <View style={styles.dockShadow}>
        <BlurView
          intensity={Platform.OS === 'android' ? 75 : 85}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.dockBlur}
        >
          <View style={styles.dockContent}>
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
        </BlurView>
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
  dockShadow: {
    maxWidth: 400,
    width: '100%',
    borderRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  dockBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.50)',
  },
  dockContent: {
    flexDirection: 'row',
    padding: 6,
    gap: 8,
    alignItems: 'center',
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
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  expenseBtn: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  reportBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
