import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function HistoryDetailScreen({ route }) {
  const item = route.params?.item;

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="History Detail"
        subtitle="Full context for one screening event"
      />

      <Card elevated>
        <Text className="text-xs font-semibold tracking-wide text-zmen-primary">
          {item?.flow || "FLOW"}
        </Text>
        <Text className="mt-2 text-xl font-bold text-zmen-text">
          {item?.title || "Untitled event"}
        </Text>
        <Text className="mt-2 text-sm text-zmen-muted">
          Recorded: {item?.date || "N/A"}
        </Text>

        <View className="mt-5 rounded-2xl bg-zmen-background p-4">
          <Text className="text-sm font-semibold text-zmen-text">
            Result classification
          </Text>
          <Text className="mt-1 text-lg font-bold text-zmen-primary">
            {item?.result || "Unknown"}
          </Text>
        </View>

        <Text className="mt-5 text-sm leading-6 text-zmen-text/80">
          This detail panel is designed for traceability and clinician
          discussion. Use it to compare trend changes, recommended actions, and
          context from previous sessions.
        </Text>
      </Card>
    </ScrollView>
  );
}
