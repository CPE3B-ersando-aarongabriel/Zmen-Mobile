import { ScrollView, Text } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function TermsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader title="Terms" subtitle="Usage and responsibility terms" />

      <Card elevated>
        <Text className="text-sm leading-7 text-zmen-text/80">
          ZMEN is a screening support platform and not a substitute for clinical
          diagnosis. Always consult licensed professionals for medical decisions
          and emergency conditions.
        </Text>
      </Card>
    </ScrollView>
  );
}
