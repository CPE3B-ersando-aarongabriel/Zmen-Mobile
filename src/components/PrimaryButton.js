import { ActivityIndicator, Pressable, Text } from "react-native";

import { cn, COMPONENT_VARIANTS } from "../constants";

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) {
  const variantClass =
    COMPONENT_VARIANTS.button[variant] || COMPONENT_VARIANTS.button.primary;
  const labelClass = variant === "ghost" ? "text-zmen-primary" : "text-white";
  const loaderColor = variant === "ghost" ? "#080890" : "#FFFFFF";

  return (
    <Pressable
      className={({ pressed }) =>
        cn(
          COMPONENT_VARIANTS.button.base,
          variantClass,
          pressed && !disabled ? "scale-[0.99] opacity-90" : "",
          disabled ? "opacity-60" : "",
          className,
        )
      }
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text className={cn("text-base font-semibold", labelClass)}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
