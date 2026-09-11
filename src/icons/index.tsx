import React from 'react'
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'

// ─── Tab bar icons ──────────────────────────────────────────────────────────
// Stroke-based outline icons, sized/coloured by the tab bar (active/inactive
// tint comes from screenOptions in (tabs)/_layout.tsx).

interface IconProps {
  size?:        number
  color?:       string
  strokeWidth?: number
}

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5l9-7 9 7v10.5a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const UsersIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 005 18.5V20"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9.5" cy="7.5" r="3.5" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M16 4.5a3.5 3.5 0 010 6.9M19.5 20v-1.5a3.5 3.5 0 00-2.3-3.29"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const DocumentIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3.5h8l4 4V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 3.5V8h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="16" x2="13" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const ReceiptIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3h12v17.2a.6.6 0 01-.93.5l-1.75-1.16a.6.6 0 00-.66 0l-1.63 1.08a.6.6 0 01-.66 0l-1.63-1.08a.6.6 0 00-.66 0l-1.63 1.08a.6.6 0 01-.66 0l-1.63-1.08a.6.6 0 00-.66 0L4.93 20.7A.6.6 0 014 20.2V3z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="7.5" x2="16" y2="7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="11.5" x2="16" y2="11.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const GearIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const PlusIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

// ─── Dashboard / settings icons ─────────────────────────────────────────────

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3.5l9 16H3z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="10" x2="12" y2="14.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="17.3" r="0.9" fill={color} stroke="none" />
  </Svg>
)

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M8 12.3l2.7 2.7L16.5 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const WalletIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7.5A2 2 0 015 5.5h13a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10.5h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="16.2" cy="14.5" r="1.1" fill={color} stroke="none" />
  </Svg>
)

export const BriefcaseIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7.5" width="18" height="12" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="13" x2="21" y2="13" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
)

export const PhoneIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6.5 3.5h3L11 8l-2 1.5a11 11 0 005.5 5.5L16 13l4.5 1.5v3a2 2 0 01-2 2C10.5 19.5 4.5 13.5 4.5 5.5a2 2 0 012-2z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const MailIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5.5" width="18" height="13" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 7l8 6 8-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const HashIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="9" y1="4" x2="6.5" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17.5" y1="4" x2="15" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="9.5" x2="20" y2="9.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3.3" y1="15" x2="19.3" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const PercentIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="17" cy="17" r="2.5" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
)

export const HardHatIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16a8 8 0 0116 0z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 4v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M2.5 16h19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M9 9.2a3 3 0 016 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="5" width="17" height="16" rx="2.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="3" x2="8" y2="7.3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16" y1="3" x2="16" y2="7.3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3.5" y1="9.8" x2="20.5" y2="9.8" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
)

export const SparkleIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2-5.2-1.8 5.2-1.8z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const SunIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="1.5" x2="12" y2="4"   stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="22.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="1.5" y1="12" x2="4" y2="12"   stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="20" y1="12" x2="22.5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.2" y1="4.2" x2="6" y2="6"     stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="18" x2="19.8" y2="19.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.2" y1="19.8" x2="6" y2="18"   stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="6" x2="19.8" y2="4.2"   stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const MoonIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const DeviceIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="12" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="20" x2="16" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const TrashIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M9 7V4.5a1 1 0 011-1h4a1 1 0 011 1V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 7l1 13.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5L18 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const ShareIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5.5" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="6" cy="12" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="18" cy="18.5" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="8.2" y1="10.7" x2="15.8" y2="6.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8.2" y1="13.3" x2="15.8" y2="17.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const MoreHorizontalIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5"  cy="12" r="1.6" fill={color} stroke="none" />
    <Circle cx="12" cy="12" r="1.6" fill={color} stroke="none" />
    <Circle cx="19" cy="12" r="1.6" fill={color} stroke="none" />
  </Svg>
)

export const PencilIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20l.9-4 11-11a1.5 1.5 0 012.1 0l1 1a1.5 1.5 0 010 2.1l-11 11z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 6.5l3.5 3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const PersonPlusIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9.5" cy="7.5" r="3.5" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M3 20v-1.5A3.5 3.5 0 016.5 15h6a3.5 3.5 0 013.5 3.5V20"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="18.5" y1="8" x2="18.5" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16"   y1="10.5" x2="21" y2="10.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const PaperPlaneIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 3L10.5 13.5M21 3l-6.5 18-4-8.5L2 8.5z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const TrendUpIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 16l6.5-6.5 4 4L21 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 6h6v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const TrendDownIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 8l6.5 6.5 4-4L21 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 18h6v-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 9l7 7 7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const BarChartIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5"  y1="19" x2="5"  y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="19" x2="12" y2="7"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="19" y1="19" x2="19" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const MapPinIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21.5s7-6.5 7-12A7 7 0 105 9.5c0 5.5 7 12 7 12z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="9.5" r="2.4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
)

// ─── Security / PIN lock icons ─────────────────────────────────────────────────

export const LockIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="9.5" rx="2.2" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Path d="M7.5 11V7.5a4.5 4.5 0 019 0V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="15.3" r="1.3" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="16.6" x2="12" y2="18.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const KeyIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M10.8 10.8L20 20M20 20v-3.2M20 20h-3.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const FingerprintIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5 0 2.1 0 3.9-1 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M12 4.5c4.14 0 7.5 3.36 7.5 7.5 0 1.3-.06 2.4-.2 3.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M8.5 19.5c1-1.5 1.5-3.4 1.5-5.5a2 2 0 114 0c0 3 1 5.5 2.5 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M6.5 17.5c.65-1.5 1-3.2 1-5.5a4.5 4.5 0 019 0c0 .8.05 1.55.15 2.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
)

export const FaceIdIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 8V6.5A2.5 2.5 0 016.5 4H8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 4h1.5A2.5 2.5 0 0120 6.5V8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 16v1.5A2.5 2.5 0 006.5 20H8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 20h1.5a2.5 2.5 0 002.5-2.5V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="9" y1="10" x2="9" y2="10.5" stroke={color} strokeWidth={strokeWidth * 1.4} strokeLinecap="round" />
    <Line x1="15" y1="10" x2="15" y2="10.5" stroke={color} strokeWidth={strokeWidth * 1.4} strokeLinecap="round" />
    <Path d="M9 15c1 .8 2 1.2 3 1.2s2-.4 3-1.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M12 10v3h-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3.5l7 2.6v5.4c0 4.6-3 8.2-7 9.3-4-1.1-7-4.7-7-9.3V6.1l7-2.6z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

// ─── Business logo ──────────────────────────────────────────────────────────

export const CameraIcon: React.FC<IconProps> = ({ size = 24, color = '#000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 8.5a1.5 1.5 0 011.5-1.5h1.6l1-1.6a1.5 1.5 0 011.27-.7h5.26a1.5 1.5 0 011.27.7l1 1.6h1.6A1.5 1.5 0 0120 8.5v9A1.5 1.5 0 0118.5 19h-13A1.5 1.5 0 014 17.5v-9z"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="3.4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
)
