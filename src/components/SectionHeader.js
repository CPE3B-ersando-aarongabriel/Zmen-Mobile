import { Text, View } from "react-native";

import { TYPOGRAPHY } from "../constants";

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <View className="mb-4 flex-row items-start justify-between">
      <View className="flex-1">
        <Text className={TYPOGRAPHY.subheading}>{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm text-zmen-muted">{subtitle}</Text> : null}
      </View>
      {action || null}
    </View>
  );
}
