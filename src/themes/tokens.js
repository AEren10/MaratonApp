export const COLORS = {
  dark: {
    background: "#0E1A16",
    surface: "#16241F",
    surface2: "#1D2E27",
    surfaceLight: "#1A2922",
    card: "#16241F",
    cardHover: "#1D2E27",
    border: "#293B33",
    borderSoft: "rgba(255,255,255,0.06)",
    borderLight: "#374E44",

    textPrimary: "#EAF3EE",
    textSecondary: "#88A498",
    textMuted: "#5E7468",
    textInverse: "#0E1A16",

    accent: "#E8C46A",
    accentLight: "#E8C46A30",
    accentDark: "#CFA94B",

    success: "#6FD6A8",
    successLight: "#6FD6A820",
    warning: "#E8C46A",
    warningLight: "#E8C46A20",
    danger: "#EC8A7E",
    dangerLight: "#EC8A7E20",
    info: "#7FB0E8",
    infoLight: "#7FB0E820",

    teal: "#57B89E",
    tealLight: "#57B89E20",
    purple: "#9B8BE0",
    purpleLight: "#9B8BE020",
    blue: "#7FB0E8",
    blueLight: "#7FB0E820",
    yellow: "#E8C46A",
    red: "#EC8A7E",
    green: "#6FD6A8",
    amber: "#E8C46A",
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
// Orman/adaçayı paleti: koyu yeşil zemin, nane primary, krem sıcak accent + ufak renk pop'ları.
export const C = {
  bg: "#0A1410",
  surface: "#16241F",
  surface2: "#1D2E27",
  border: "#293B33",
  borderSoft: "rgba(255,255,255,0.06)",
  amber: "#E8C46A",
  green: "#6FD6A8",
  yellow: "#E8C46A",
  red: "#EC8A7E",
  teal: "#57B89E",
  purple: "#9B8BE0",
  blue: "#7FB0E8",
  cream: "#FBF1DC",
  text: "#EAF3EE",
  sec: "#88A498",
  muted: "#5E7468",
};

// Çok renkli pastel paleti — her bölüme yumuşak bir kimlik rengi.
// Her tonun: solid (ikon/metin), tint (yumuşak arka plan).
// Dark zeminde canlı ama göz yormayan, "AI değil" hissi.
// Orman tabanına uyumlu ufak renk pop'ları (ikon/sayı için, surface'ler nötr kalır).
export const PASTEL = {
  peach:   { solid: "#F0907E", tint: "rgba(240,144,126,0.14)" },
  coral:   { solid: "#F0907E", tint: "rgba(240,144,126,0.14)" },
  blue:    { solid: "#7FB0E8", tint: "rgba(127,176,232,0.14)" },
  violet:  { solid: "#9B8BE0", tint: "rgba(155,139,224,0.14)" },
  mint:    { solid: "#6FD6A8", tint: "rgba(111,214,168,0.14)" },
  teal:    { solid: "#57B89E", tint: "rgba(87,184,158,0.14)" },
  gold:    { solid: "#E8C46A", tint: "rgba(232,196,106,0.14)" },
  rose:    { solid: "#EC8FB4", tint: "rgba(236,143,180,0.14)" },
  sky:     { solid: "#5FC9CE", tint: "rgba(95,201,206,0.14)" },
  cream:   { solid: "#FBF1DC", tint: "rgba(251,241,220,0.12)" },
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
