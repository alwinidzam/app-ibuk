import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { BookId } from '../types';

interface Props {
  activeBook: BookId;
}

interface AmbientConfig {
  canvasBg: string;
  keyColor: string;
  fillColor: string;
}

const AMBIENT_CONFIGS: Record<string, AmbientConfig> = {
  sekolah: {
    canvasBg: '#F8FAFC',
    keyColor: '#0284C7',
    fillColor: '#6366F1',
  },
  ibu: {
    canvasBg: '#FAF7FB',
    keyColor: '#A855F7',
    fillColor: '#EC4899',
  },
  rumah: {
    canvasBg: '#F6FAF7',
    keyColor: '#10B981',
    fillColor: '#0284C7',
  },
};

const DEFAULT_CONFIG: AmbientConfig = {
  canvasBg: '#F8FAFC',
  keyColor: '#0284C7',
  fillColor: '#6366F1',
};

export function NativeAmbientBackground({ activeBook }: Props) {
  const config = AMBIENT_CONFIGS[activeBook] || DEFAULT_CONFIG;
  const { width, height } = Dimensions.get('window');

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: config.canvasBg }]}
      pointerEvents="none"
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* 
            Atmospheric Key Wash (Top-Right to Center-Left)
            Menggunakan Sigmoid Non-Linear Easing 6 Stops & Solid Hex stopColor dengan stopOpacity.
            Mencegah Skia Android Premultiplied Alpha Dark Fringe & Mach Banding!
          */}
          <LinearGradient
            id="ambientKeyWash"
            x1="100%"
            y1="0%"
            x2="15%"
            y2="75%"
          >
            <Stop offset="0%" stopColor={config.keyColor} stopOpacity={0.14} />
            <Stop offset="20%" stopColor={config.keyColor} stopOpacity={0.09} />
            <Stop offset="40%" stopColor={config.keyColor} stopOpacity={0.05} />
            <Stop offset="65%" stopColor={config.keyColor} stopOpacity={0.02} />
            <Stop offset="90%" stopColor={config.keyColor} stopOpacity={0.005} />
            <Stop offset="100%" stopColor={config.keyColor} stopOpacity={0} />
          </LinearGradient>

          {/* 
            Atmospheric Fill Wash (Bottom-Left behind Floating Dock to Top-Right)
          */}
          <LinearGradient
            id="ambientFillWash"
            x1="0%"
            y1="100%"
            x2="85%"
            y2="35%"
          >
            <Stop offset="0%" stopColor={config.fillColor} stopOpacity={0.12} />
            <Stop offset="25%" stopColor={config.fillColor} stopOpacity={0.075} />
            <Stop offset="50%" stopColor={config.fillColor} stopOpacity={0.04} />
            <Stop offset="75%" stopColor={config.fillColor} stopOpacity={0.015} />
            <Stop offset="100%" stopColor={config.fillColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Base Silk Canvas */}
        <Rect x="0" y="0" width={width} height={height} fill={config.canvasBg} />

        {/* Ethereal Atmospheric Layers (100% Smooth without Mach Banding) */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#ambientKeyWash)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#ambientFillWash)" />
      </Svg>
    </View>
  );
}
