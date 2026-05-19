export const COLORS = {
  // Primários
  PRIMARY: "#f59e0b", // amber-500
  PRIMARY_DARK: "#d97706", // amber-600
  PRIMARY_LIGHT: "#fbbf24", // amber-400

  // Neutros
  BLACK: "#000000",
  NEUTRAL_800: "#262626",
  NEUTRAL_700: "#404040",
  NEUTRAL_600: "#525252",
  NEUTRAL_400: "#a3a3a3",
  WHITE: "#ffffff",

  // Semântica
  SUCCESS: "#22c55e", // green-500
  ERROR: "#ef4444", // red-500
  WARNING: "#f59e0b", // amber-500
  INFO: "#3b82f6", // blue-500

  // Opacidades
  WHITE_10: "rgba(255,255,255,0.1)",
  WHITE_20: "rgba(255,255,255,0.2)",
  WHITE_40: "rgba(255,255,255,0.4)",
  WHITE_60: "rgba(255,255,255,0.6)",
  WHITE_80: "rgba(255,255,255,0.8)",
} as const;

export const TRANSITIONS = {
  FAST: "150ms",
  DEFAULT: "300ms",
  SLOW: "500ms",
} as const;

export const Z_INDEX = {
  BASE: 0,
  HEADER: 50,
  MODAL: 50,
  DROPDOWN: 100,
  TOAST: 150,
} as const;

export const BORDER_RADIUS = {
  SM: "0.375rem",
  DEFAULT: "0.5rem",
  MD: "0.75rem",
  LG: "1rem",
  XL: "1.5rem",
  FULL: "9999px",
} as const;

export const MAX_WIDTH = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
} as const;
