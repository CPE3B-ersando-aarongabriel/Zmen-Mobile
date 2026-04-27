import { View } from "react-native";

import { cn, COMPONENT_VARIANTS } from "../constants";

export default function Card({ children, elevated = false, className = "" }) {
  return (
    <View
      className={cn(
        elevated ? COMPONENT_VARIANTS.card.elevated : COMPONENT_VARIANTS.card.base,
        className,
      )}
    >
      {children}
    </View>
  );
}
