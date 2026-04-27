import { Text, TextInput, View } from "react-native";

import { cn, COLORS, COMPONENT_VARIANTS, TYPOGRAPHY } from "../constants";

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  className = "",
}) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className={cn("mb-2 font-semibold", TYPOGRAPHY.caption)}>
          {label}
        </Text>
      ) : null}
      <TextInput
        className={cn(
          COMPONENT_VARIANTS.input.base,
          multiline ? "min-h-24 py-4" : "",
          className,
        )}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}
