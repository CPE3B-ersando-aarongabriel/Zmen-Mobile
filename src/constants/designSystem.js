import { COLORS } from "./colors";
import { SHADOWS } from "./shadows";
import { SPACING } from "./spacing";
import { TYPOGRAPHY } from "./typography";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

export const COMPONENT_VARIANTS = {
  button: {
    base: "rounded-2xl px-5 py-4 items-center justify-center",
    primary: `bg-zmen-primary ${SHADOWS.elevated}`,
    secondary: "bg-zmen-secondary",
    ghost: "bg-zmen-white border border-zmen-muted/40",
  },
  card: {
    base: `rounded-3xl bg-zmen-white p-5 ${SHADOWS.card}`,
    elevated: `rounded-3xl bg-zmen-white p-5 ${SHADOWS.elevated}`,
  },
  input: {
    base: "rounded-2xl border border-zmen-muted/40 bg-zmen-white px-4 py-3 text-zmen-text",
    focused: "border-zmen-primary",
  },
  risk: {
    low: "bg-green-50 border-green-200 text-green-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    high: "bg-red-50 border-red-200 text-red-700",
  },
};

export const DESIGN_SYSTEM = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  variants: COMPONENT_VARIANTS,
};
