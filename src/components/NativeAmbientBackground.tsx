import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { BookId } from '../types';

interface Props {
  activeBook: BookId;
}

interface AmbientConfig {
  keyColor1: string;
  keyColor2: string;
  fillColor1: string;
  fillColor2: string;
  canvasBg: string;
}

const AMBIENT_CONFIGS: Record<string, AmbientConfig> = {
  sekolah: {
    canvasBg: '#F8FAFC', // Apple System Grouped Light
    keyColor1: 'rgba(14, 165, 233, 0.22)', // Sky Blue
    keyColor2: 'rgba(37, 99, 235, 0.10)', // Apple Royal Blue
    fillColor1: 'rgba(99, 102, 241, 0.16)', // Soft Indigo (Dock refractor)
    fillColor2: 'rgba(14, 165, 233, 0.08)',
  },
  ibu: {
    canvasBg: '#FAF7FB',
    keyColor1: 'rgba(175, 82, 222, 0.20)', // Apple Orchid
    keyColor2: 'rgba(217, 70, 239, 0.10)', // Magenta
    fillColor1: 'rgba(244, 114, 182, 0.16)', // Soft Rose (Dock refractor)
    fillColor2: 'rgba(168, 85, 247, 0.08)',
  },
  rumah: {
    canvasBg: '#F6FAF7',
    keyColor1: 'rgba(16, 185, 129, 0.20)', // Emerald Mint
    keyColor2: 'rgba(52, 199, 89, 0.11)', // Apple Green
    fillColor1: 'rgba(14, 165, 233, 0.15)', // Cyan Mist (Dock refractor)
    fillColor2: 'rgba(5, 150, 105, 0.08)',
  },
};

const DEFAULT_CONFIG: AmbientConfig = {
  canvasBg: '#F8FAFC',
  keyColor1: 'rgba(14, 165, 233, 0.18)',
  keyColor2: 'rgba(99, 102, 241, 0.08)',
  fillColor1: 'rgba(16, 185, 129, 0.12)',
  fillColor2: 'rgba(14, 165, 233, 0.06)',
};

export function NativeAmbientBackground({ activeBook }: Props) {
  const config = AMBIENT_CONFIGS[activeBook] || DEFAULT_CONFIG;
  const { width, height } = Dimensions.get('window');

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: config.canvasBg }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Top-Right Key Light (Book Identity Glow) */}
          <RadialGradient
            id="keyLight"
            cx="85%"
            cy="10%"
            rx="65%"
            ry="45%"
            fx="85%"
            fy="10%"
          >
            <Stop offset="0%" stopColor={config.keyColor1} />
            <Stop offset="50%" stopColor={config.keyColor2} />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>

          {/* Bottom-Left Fill Light (Refraction light behind Floating Dock) */}
          <RadialGradient
            id="fillLight"
            cx="15%"
            cy="90%"
            rx="60%"
            ry="40%"
            fx="15%"
            fy="90%"
          >
            <Stop offset="0%" stopColor={config.fillColor1} />
            <Stop offset="55%" stopColor={config.fillColor2} />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base Canvas */}
        <Rect x="0" y="0" width={width} height={height} fill={config.canvasBg} />

        {/* Ambient Diffusion Lights */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#keyLight)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#fillLight)" />
      </Svg>
    </View>
  );
}
