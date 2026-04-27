import { COLORS } from "./colors";
import { SHADOWS } from "./shadows";
import { SPACING } from "./spacing";
import { TYPOGRAPHY } from "./typography";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

export const COMPONENT_VARIANTS = {
  button: {
    base: "min-h-12 rounded-2xl px-5 py-3.5 items-center justify-center",
    primary: `bg-zmen-primary border border-zmen-primary ${SHADOWS.elevated}`,
    secondary: "bg-zmen-secondary border border-zmen-secondary",
    ghost: "bg-zmen-white border border-zmen-muted",
  },
  card: {
    base: `rounded-2xl border border-zmen-muted/55 bg-zmen-white p-4 ${SHADOWS.card}`,
    elevated: `rounded-3xl border border-zmen-muted/55 bg-zmen-white p-5 ${SHADOWS.elevated}`,
  },
  input: {
    base: "min-h-12 rounded-2xl border border-zmen-muted bg-zmen-white px-4 py-3 text-base text-zmen-text",
    focused: "border-zmen-primary",
  },
  risk: {
    low: "bg-zmen-secondary/12 border-zmen-secondary/40 text-zmen-primary",
    medium: "bg-zmen-secondary/20 border-zmen-secondary/60 text-zmen-primary",
    high: "bg-zmen-primary/12 border-zmen-primary/35 text-zmen-primary",
  },
};

export const DESIGN_SYSTEM = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  variants: COMPONENT_VARIANTS,
};
