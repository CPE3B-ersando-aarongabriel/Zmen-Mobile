import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function FloatingChatButton({ onPress }) {
  return (
    <View className="absolute bottom-24 right-5 z-50">
      <Pressable
        className="h-16 w-16 items-center justify-center rounded-full bg-zmen-primary shadow-lg shadow-zmen-primary/40"
        onPress={onPress}
      >
        <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
      </Pressable>
      <Text className="mt-2 text-center text-xs font-semibold text-zmen-primary">AI Help</Text>
    </View>
  );
}
