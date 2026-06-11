export const COLORS = {
  dark: {
    background: "#0A0A0F",
    surface: "#1A1A23",
    surface2: "#22222E",
    surfaceLight: "#1C1C24",
    card: "#1A1A23",
    cardHover: "#22222E",
    border: "#2A2A36",
    borderSoft: "rgba(255,255,255,0.06)",
    borderLight: "#3A3A48",

    textPrimary: "#FFFFFF",
    textSecondary: "#A0A0B0",
    textMuted: "#6B6B7B",
    textInverse: "#0A0A0F",

    accent: "#F5A623",
    accentLight: "#F5A62330",
    accentDark: "#D4900E",

    success: "#34D399",
    successLight: "#34D39920",
    warning: "#FBBF24",
    warningLight: "#FBBF2420",
    danger: "#EF4444",
    dangerLight: "#EF444420",
    info: "#60A5FA",
    infoLight: "#60A5FA20",

    teal: "#2DD4BF",
    tealLight: "#2DD4BF20",
    purple: "#A78BFA",
    purpleLight: "#A78BFA20",
    blue: "#60A5FA",
    blueLight: "#60A5FA20",
    yellow: "#FBBF24",
    red: "#EF4444",
    green: "#34D399",
    amber: "#F5A623",
  },
};

// Alias for design file consistency: C.bg, C.amber, etc.
export const C = {
  bg: "#0A0A0F",
  surface: "#1A1A23",
  surface2: "#22222E",
  border: "#2A2A36",
  borderSoft: "rgba(255,255,255,0.06)",
  amber: "#F5A623",
  green: "#34D399",
  yellow: "#FBBF24",
  red: "#EF4444",
  teal: "#2DD4BF",
  purple: "#A78BFA",
  blue: "#60A5FA",
  text: "#FFFFFF",
  sec: "#A0A0B0",
  muted: "#6B6B7B",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const TYPOGRAPHY = {
  heading: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, lineHeight: 36, letterSpacing: -0.5 },
  subheading: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 20, lineHeight: 28 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  bodySemiBold: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: "Inter_500Medium", fontSize: 11, lineHeight: 14 },
  stat: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 46, lineHeight: 52, letterSpacing: -1 },
  statLarge: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 52, lineHeight: 58, letterSpacing: -1.5 },
  statSmall: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, lineHeight: 32, letterSpacing: -0.5 },
  button: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 20 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  amber: {
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
};
