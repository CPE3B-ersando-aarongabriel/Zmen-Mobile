import { ScrollView, Text } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function EducationalContentScreen() {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="gap-3 px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="Educational Content"
        subtitle="Medical-grade learning modules"
      />

      {[
        "Understanding urinary markers",
        "How pH impacts fertility context",
        "When to consult specialists early",
      ].map((item) => (
        <Card key={item}>
          <Text className="text-base font-semibold text-zmen-text">{item}</Text>
          <Text className="mt-2 text-sm leading-6 text-zmen-text/80">
            Structured mini-lessons with practical interpretation tips and
            actionable context.
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}
