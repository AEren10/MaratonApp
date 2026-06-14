export const COLORS = {
  dark: {
    background: "#0C0D11",
    surface: "#16171D",
    surface2: "#1E2029",
    surfaceLight: "#191A22",
    card: "#16171D",
    cardHover: "#1E2029",
    border: "#282A34",
    borderSoft: "rgba(255,255,255,0.06)",
    borderLight: "#363949",

    textPrimary: "#F2F3F6",
    textSecondary: "#9A9EAB",
    textMuted: "#686C7A",
    textInverse: "#0C0D11",

    accent: "#EBAE63",
    accentLight: "#EBAE6330",
    accentDark: "#D4923E",

    success: "#4ECE8E",
    successLight: "#4ECE8E20",
    warning: "#F2C879",
    warningLight: "#F2C87920",
    danger: "#F2706E",
    dangerLight: "#F2706E20",
    info: "#6FA8F2",
    infoLight: "#6FA8F220",

    teal: "#46C7B0",
    tealLight: "#46C7B020",
    purple: "#A99BF5",
    purpleLight: "#A99BF520",
    blue: "#6FA8F2",
    blueLight: "#6FA8F220",
    yellow: "#F2C879",
    red: "#F2706E",
    green: "#4ECE8E",
    amber: "#EBAE63",
  },
  light: {
    background: "#FBFBFD",
    surface: "#FFFFFF",
    surface2: "#F4F5F8",
    surfaceLight: "#F8F8FB",
    card: "#FFFFFF",
    cardHover: "#F4F5F8",
    border: "#E6E7EC",
    borderSoft: "rgba(0,0,0,0.05)",
    borderLight: "#D5D7DE",

    textPrimary: "#16181F",
    textSecondary: "#5A5E6B",
    textMuted: "#9A9EAA",
    textInverse: "#FFFFFF",

    accent: "#C8923F",
    accentLight: "#C8923F18",
    accentDark: "#A8772C",

    success: "#16A34A",
    successLight: "#16A34A18",
    warning: "#D97706",
    warningLight: "#D9770618",
    danger: "#DC2626",
    dangerLight: "#DC262618",
    info: "#2563EB",
    infoLight: "#2563EB18",

    teal: "#0D9488",
    tealLight: "#0D948818",
    purple: "#7C3AED",
    purpleLight: "#7C3AED18",
    blue: "#2563EB",
    blueLight: "#2563EB18",
    yellow: "#D97706",
    red: "#DC2626",
    green: "#16A34A",
    amber: "#C8923F",
  },
};

// Returns a C-shaped palette for the given scheme
export function paletteFor(scheme) {
  const src = scheme === "light" ? COLORS.light : COLORS.dark;
  return {
    bg: src.background,
    surface: src.surface,
    surface2: src.surface2,
    border: src.border,
    borderSoft: src.borderSoft,
    amber: src.amber,
    green: src.green,
    yellow: src.yellow,
    red: src.red,
    teal: src.teal,
    purple: src.purple,
    blue: src.blue,
    text: src.textPrimary,
    sec: src.textSecondary,
    muted: src.textMuted,
  };
}

// Alias for design file consistency: C.bg, C.amber, etc.
// Premium refresh: sıcak off-black zemin, yumuşak bal-altın accent (harsh amber yerine),
// kırık-beyaz metin, daha yumuşak desature semantik tonlar.
export const C = {
  bg: "#0C0D11",
  surface: "#16171D",
  surface2: "#1E2029",
  border: "#282A34",
  borderSoft: "rgba(255,255,255,0.06)",
  amber: "#EBAE63",
  green: "#4ECE8E",
  yellow: "#F2C879",
  red: "#F2706E",
  teal: "#46C7B0",
  purple: "#A99BF5",
  blue: "#6FA8F2",
  text: "#F2F3F6",
  sec: "#9A9EAB",
  muted: "#686C7A",
};

// Çok renkli pastel paleti — her bölüme yumuşak bir kimlik rengi.
// Her tonun: solid (ikon/metin), tint (yumuşak arka plan).
// Dark zeminde canlı ama göz yormayan, "AI değil" hissi.
export const PASTEL = {
  peach:   { solid: "#FF7A5C", tint: "rgba(255,122,92,0.15)" },
  coral:   { solid: "#FF7A5C", tint: "rgba(255,122,92,0.15)" },
  blue:    { solid: "#3D93FF", tint: "rgba(61,147,255,0.15)" },
  violet:  { solid: "#9B6BFF", tint: "rgba(155,107,255,0.15)" },
  mint:    { solid: "#1FD494", tint: "rgba(31,212,148,0.15)" },
  gold:    { solid: "#FFBA3D", tint: "rgba(255,186,61,0.15)" },
  rose:    { solid: "#FF5C97", tint: "rgba(255,92,151,0.15)" },
  sky:     { solid: "#25C9DC", tint: "rgba(37,201,220,0.15)" },
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
  stat: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  statLarge: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, lineHeight: 48, letterSpacing: -1.2 },
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
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  // Glow yumuşatıldı (neon hissi yerine premium yumuşak parıltı)
  amber: {
    shadowColor: "#EBAE63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 7,
  },
  fab: {
    shadowColor: "#EBAE63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
};
