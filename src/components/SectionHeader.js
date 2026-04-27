import { Text, View } from "react-native";

import { TYPOGRAPHY } from "../constants";

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <View className="mb-4 flex-row items-start justify-between">
      <View className="flex-1">
        <Text className={TYPOGRAPHY.H2}>{title}</Text>
        {subtitle ? (
          <Text className={TYPOGRAPHY.caption}>{subtitle}</Text>
        ) : null}
      </View>
      {action || null}
    </View>
  );
}
