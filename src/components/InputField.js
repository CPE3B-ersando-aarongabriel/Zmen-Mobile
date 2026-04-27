import { Text, TextInput, View } from "react-native";

import { cn, COMPONENT_VARIANTS } from "../constants";

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
      {label ? <Text className="mb-2 text-sm font-semibold text-zmen-text">{label}</Text> : null}
      <TextInput
        className={cn(
          COMPONENT_VARIANTS.input.base,
          multiline ? "min-h-24 py-4" : "",
          className,
        )}
        placeholder={placeholder}
        placeholderTextColor="#9AA1B6"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}
