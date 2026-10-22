import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      toValue: 0.94,
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
        activeOpacity={0.92}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function NativeDock({ onOpenCreate, onOpenReport }: Props) {
  const insets = useSafeAreaInsets();

  // FORMULA EXACT INSET CLEARANCE:
  // - 3-Button Nav Android: insets.bottom = 48-56dp -> bottomOffset = 48 + 12 = 60dp (mengapung pas di atas nav bar)
  // - Gesture Bar Pill: insets.bottom = 16-24dp -> bottomOffset = 20 + 12 = 32dp
  // - Hidden / Full Immersive: insets.bottom = 0dp -> bottomOffset = 16 + 12 = 28dp
  const bottomOffset = Math.max(insets.bottom, 16) + 12;

  return (
    <View
      style={[styles.dockContainer, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      {/* Dual Layer Drop Shadow (Atmospheric Float) */}
      <View style={styles.dockShadowWrap}>
        <View style={styles.dockContactShadow} />

        <BlurView
          intensity={Platform.OS === 'android' ? 70 : 85}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.dockBlur}
        >
          {/* Inner Refraction Sheen Layer */}
          <View style={styles.specularRimOverlay} pointerEvents="none" />

          <View style={styles.dockContent}>
            {/* Tombol Kas Masuk (Apple Emerald Jewel) */}
            <DockButton
              style={[styles.btn, styles.incomeBtn]}
              flexWeight={1}
              onPress={() => onOpenCreate('in')}
              hapticType="medium"
            >
              <View style={styles.btnIconWrap}>
                <ArrowDownIcon size={16} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <Text style={styles.btnTextWhite}>Masuk</Text>
            </DockButton>

            {/* Tombol Kas Keluar (Apple Carmine Ruby Jewel) */}
            <DockButton
              style={[styles.btn, styles.expenseBtn]}
              flexWeight={1}
              onPress={() => onOpenCreate('out')}
              hapticType="medium"
            >
              <View style={styles.btnIconWrap}>
                <ArrowUpIcon size={16} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <Text style={styles.btnTextWhite}>Keluar</Text>
            </DockButton>

            {/* Tombol Laporan (Frosted Translucent Pearl) */}
            <DockButton
              style={[styles.btn, styles.reportBtn]}
              flexWeight={0.88}
              onPress={onOpenReport}
              hapticType="light"
            >
              <DocumentTextIcon size={17} color="#1E293B" strokeWidth={2.2} />
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
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 99,
  },
  dockShadowWrap: {
    maxWidth: 400,
    width: '100%',
    borderRadius: 28,
    position: 'relative',
    // Ambient Occlusion Cast Shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  dockContactShadow: {
    position: 'absolute',
    top: 2,
    left: 12,
    right: 12,
    bottom: -2,
    borderRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  dockBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderTopColor: 'rgba(255, 255, 255, 0.96)', // Specular Top Highlight
    borderBottomColor: 'rgba(255, 255, 255, 0.45)', // Fresnel Bottom Falloff
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.52)' : 'rgba(255, 255, 255, 0.45)',
  },
  specularRimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
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
  btnIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeBtn: {
    backgroundColor: '#059669',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseBtn: {
    backgroundColor: '#E11D48',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 3,
  },
  reportBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  btnTextWhite: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  btnTextDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
});
