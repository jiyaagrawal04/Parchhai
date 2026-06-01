import { Platform } from "react-native";

// Heritage Mobile Experience palette (from the mobile DESIGN.md)
export const colors = {
  surface: "#FEF9F0",
  paper: "#FFFFFF",
  surfaceAlt: "#F2EDE4",
  indigo: "#041534",
  indigoSoft: "#1B2A4A",
  rust: "#A23E30",
  gold: "#B8893B",
  ink: "#1D1C16",
  muted: "#75777F",
  line: "#E7E2D9",
  onIndigo: "#FFFFFF",
  success: "#2E7D32",
};

// Mobile uses soft 4px corners per the design system.
export const radius = { sm: 4, md: 6, lg: 8, pill: 999 };
export const space = (n: number) => n * 8;

export const serif = Platform.select({ ios: "Georgia", android: "serif", default: "serif" });

export const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
