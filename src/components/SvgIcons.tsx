import React from 'react';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// -------------------------------------------------------------
// BOOK ICONS (Pure SVG)
// -------------------------------------------------------------

/** Sekolah: SF Symbol graduationcap (Mortarboard, skull cap, and tassel) */
export function SchoolIcon({ size = 20, color = '#0284C7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10L12 5L2 10L12 15L22 10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12.5V17C6 17 8.5 19.5 12 19.5C15.5 19.5 18 17 18 17V12.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 10V16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="22" cy="16.5" r="0.8" fill={color} />
    </Svg>
  );
}

/** Ibu-Ibu: SF Symbol person.2 (Community / Perkumpulan Ibu-Ibu PKK & Arisan) */
export function MotherIcon({ size = 20, color = '#8B5CF6', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="9"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Rumah: SF Symbol house (Clean Architectural Pitched Roof & Doorway) */
export function HomeIcon({ size = 20, color = '#10B981', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Masjid / Gedung: SF Symbol building.columns */
export function BuildingIcon({ size = 20, color = '#0A84FF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l10 7H2l10-7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Toko / Usaha: SF Symbol cart */
export function StoreIcon({ size = 20, color = '#FF9500', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M16 10a4 4 0 0 1-8 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Sosial / Kasih / Donasi: SF Symbol heart */
export function HeartIcon({ size = 20, color = '#FF2D55', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Proyek / Spesial: SF Symbol star */
export function StarIcon({ size = 20, color = '#FFCC00', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Umum / Tag: SF Symbol tag */
export function TagIcon({ size = 20, color = '#636366', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Plus Action: SF Symbol plus */
export function PlusIcon({ size = 18, color = '#000000', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Dynamic Book SVG Resolver */
export function BookSvgIcon({ icon, size = 18, color = '#000000', strokeWidth = 2 }: { icon?: string; size?: number; color?: string; strokeWidth?: number }) {
  switch (icon) {
    case 'sekolah':
    case 'school':
      return <SchoolIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'ibu':
    case 'mother':
    case 'community':
      return <MotherIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'rumah':
    case 'home':
      return <HomeIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'building':
    case 'masjid':
    case 'mosque':
      return <BuildingIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'store':
    case 'shop':
    case 'cart':
      return <StoreIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'heart':
    case 'social':
      return <HeartIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'star':
      return <StarIcon size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return <TagIcon size={size} color={color} strokeWidth={strokeWidth} />;
  }
}

// -------------------------------------------------------------
// UI SYSTEM ICONS (Pure SVG)
// -------------------------------------------------------------

export function ArrowDownIcon({ size = 18, color = '#10B981', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M19 12l-7 7-7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowUpIcon({ size = 18, color = '#EF4444', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 18, color = '#10B981', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8.5 12.5l2.5 2.5 5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color = '#0F172A', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 20, color = '#0F172A', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArchiveIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DocumentTextIcon({ size = 20, color = '#0F172A', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 18, color = '#EF4444', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CameraIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function ImageIcon({ size = 20, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path
        d="M21 15l-5-5L5 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size = 20, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="8.59"
        y1="13.51"
        x2="15.42"
        y2="17.49"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="15.41"
        y1="6.51"
        x2="8.59"
        y2="10.49"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export function WhatsAppIcon({ size = 20, color = '#FFFFFF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PrintIcon({ size = 20, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 14h12v8H6z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 18, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function InfoIcon({ size = 18, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="16" x2="12" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="7.5" r="1" fill={color} />
    </Svg>
  );
}

export function SparklesIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// -------------------------------------------------------------
// CATEGORY ICONS (Pure SVG, 0 Emojis)
// -------------------------------------------------------------

/** Saldo Awal: Vault Safe / Stacked Coins */
export function VaultIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 9v1M15 12h-1M12 15v-1M9 12h1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Iuran Siswa: Student Bag / Backpack */
export function BackpackIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 14h8M8 10h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Dana Sekolah / Bank: Building Pillars */
export function PillarIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 21h20M3 7h18M12 2l9 5H3l9-5zM6 7v10M10 7v10M14 7v10M18 7v10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Sumbangan / Bantuan: Helping Hands */
export function HandshakeIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 17l-5-5a3 3 0 0 1 4.24-4.24l1.76 1.76 1.76-1.76A3 3 0 0 1 18 12l-7 7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** ATK & Fotokopi: Pencil & Document */
export function PenToolIcon({ size = 18, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.58 7.58"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Konsumsi: Cup / Cutlery */
export function CoffeeIcon({ size = 18, color = '#D97706', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Kegiatan: Sparkle Award */
export function SparkleIcon({ size = 18, color = '#8B5CF6', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 6.6L21 11l-5.6 4.4L17 22l-5-3.8L7 22l1.6-6.6L3 11l6.6-2.4L12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Perbaikan: Tools Wrench */
export function WrenchIcon({ size = 18, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Transport: Vehicle / Commute */
export function BusIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="15" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 10h18M6 18v2M18 18v2M7 14h.01M17 14h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Iuran Bulanan: Banknote Cash */
export function BanknoteIcon({ size = 18, color = '#10B981', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Setoran Arisan / Arisan Keluar: Rotating Circular Swap */
export function ArisanIcon({ size = 18, color = '#8B5CF6', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Dana Sosial: Heart with Bouquet Care */
export function HeartCareIcon({ size = 18, color = '#EC4899', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Uang Bulanan: Briefcase / Salary */
export function BriefcaseIcon({ size = 18, color = '#10B981', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Kiriman: Mail Envelope */
export function MailIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Jualan: Shopping Bag */
export function ShoppingBagIcon({ size = 18, color = '#F59E0B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Belanja Dapur: Basket Grocery */
export function BasketIcon({ size = 18, color = '#10B981', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 10h20M4 10l2 11h12l2-11M12 2v4M8 4l2 6M16 4l-2 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Listrik & Air: Bulb / Energy */
export function BulbIcon({ size = 18, color = '#F59E0B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Gas & Beras: Flame Gas Cylinder */
export function FlameIcon({ size = 18, color = '#EF4444', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c2 4 6 7 6 12a6 6 0 1 1-12 0c0-3 2-6 6-12z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 14a2 2 0 0 0 2 2c0-2-1-3-2-5-1 2-2 3-2 5a2 2 0 0 0 2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Sekolah Anak: Open Book */
export function BookOpenIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Pulsa & Paket Data: Smartphone */
export function PhoneDeviceIcon({ size = 18, color = '#0284C7', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round" />
    </Svg>
  );
}

/** Kesehatan: Medical Cross / Capsule */
export function CrossIcon({ size = 18, color = '#EF4444', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Lainnya: Tag Note */
export function TagNoteIcon({ size = 18, color = '#64748B', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// -------------------------------------------------------------
// DYNAMIC CATEGORY ICON RENDERER (Map category name -> Pure SVG)
// -------------------------------------------------------------

export function CategorySvgIcon({
  name,
  size = 18,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const norm = name.toLowerCase().trim();

  if (norm.includes('saldo awal')) {
    return <VaultIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('iuran siswa')) {
    return <BackpackIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('dana sekolah')) {
    return <PillarIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('sumbangan')) {
    return <HandshakeIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('atk') || norm.includes('fotokopi')) {
    return <PenToolIcon size={size} color={color || '#64748B'} />;
  }
  if (norm.includes('konsumsi')) {
    return <CoffeeIcon size={size} color={color || '#D97706'} />;
  }
  if (norm.includes('kegiatan')) {
    return <SparkleIcon size={size} color={color || '#8B5CF6'} />;
  }
  if (norm.includes('perbaikan')) {
    return <WrenchIcon size={size} color={color || '#64748B'} />;
  }
  if (norm.includes('transport')) {
    return <BusIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('iuran bulanan')) {
    return <BanknoteIcon size={size} color={color || '#10B981'} />;
  }
  if (norm.includes('arisan')) {
    return <ArisanIcon size={size} color={color || '#8B5CF6'} />;
  }
  if (norm.includes('dana sosial')) {
    return <HeartCareIcon size={size} color={color || '#EC4899'} />;
  }
  if (norm.includes('uang bulanan')) {
    return <BriefcaseIcon size={size} color={color || '#10B981'} />;
  }
  if (norm.includes('kiriman')) {
    return <MailIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('jualan')) {
    return <ShoppingBagIcon size={size} color={color || '#F59E0B'} />;
  }
  if (norm.includes('belanja dapur')) {
    return <BasketIcon size={size} color={color || '#10B981'} />;
  }
  if (norm.includes('listrik') || norm.includes('air')) {
    return <BulbIcon size={size} color={color || '#F59E0B'} />;
  }
  if (norm.includes('gas') || norm.includes('beras')) {
    return <FlameIcon size={size} color={color || '#EF4444'} />;
  }
  if (norm.includes('sekolah anak')) {
    return <BookOpenIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('pulsa')) {
    return <PhoneDeviceIcon size={size} color={color || '#0284C7'} />;
  }
  if (norm.includes('kesehatan')) {
    return <CrossIcon size={size} color={color || '#EF4444'} />;
  }

  // Default fallback icon
  return <TagNoteIcon size={size} color={color || '#64748B'} />;
}
