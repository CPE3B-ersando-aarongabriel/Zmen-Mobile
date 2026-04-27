import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { COLORS } from "../constants";

export default function FloatingChatButton({ onPress }) {
  return (
    <View className="absolute bottom-24 right-5 z-50">
      <Pressable
        className={({ pressed }) =>
          `h-16 w-16 items-center justify-center rounded-full bg-zmen-primary shadow-lg shadow-zmen-primary/40 ${
            pressed ? "scale-[0.98] opacity-95" : ""
          }`
        }
        onPress={onPress}
      >
        <Ionicons name="chatbubbles" size={24} color={COLORS.white} />
      </Pressable>
      <Text className="mt-2 text-center text-xs font-semibold text-zmen-primary">
        AI Help
      </Text>
    </View>
  );
}
