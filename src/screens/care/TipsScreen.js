import { ScrollView, Text } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

const TIPS = [
  "Hydrate consistently across the day rather than in one period.",
  "Avoid high heat exposure immediately before sampling.",
  "Repeat scans under similar conditions for stable trend comparison.",
  "Log symptoms right after they occur to improve data reliability.",
];

export default function TipsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="gap-3 px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="Daily Tips"
        subtitle="Small actions with long-term impact"
      />

      {TIPS.map((tip, index) => (
        <Card key={tip}>
          <Text className="text-xs font-semibold tracking-wide text-zmen-primary">
            TIP {index + 1}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-zmen-text/80">
            {tip}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}
