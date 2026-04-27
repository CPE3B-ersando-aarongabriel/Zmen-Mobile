import { Text, View } from "react-native";

export default function ScannerFrame({ label = "Align sample inside frame" }) {
  return (
    <View className="h-72 w-full items-center justify-center rounded-3xl border border-dashed border-zmen-secondary/70 bg-zmen-primary/5">
      <View className="absolute left-6 top-6 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-zmen-primary" />
      <View className="absolute right-6 top-6 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-zmen-primary" />
      <View className="absolute bottom-6 left-6 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-zmen-primary" />
      <View className="absolute bottom-6 right-6 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-zmen-primary" />
      <Text className="text-sm font-medium text-zmen-primary">{label}</Text>
    </View>
  );
}
