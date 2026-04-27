import { ScrollView, Text } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function TestingKitInfoScreen() {
  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="gap-3 px-5 pb-10 pt-6">
      <SectionHeader title="Testing Kit Info" subtitle="Usage, storage, and expiry guidance" />

      <Card elevated>
        <Text className="text-base font-semibold text-zmen-text">Kit handling checklist</Text>
        <Text className="mt-2 text-sm leading-7 text-zmen-text/80">
          Store kits away from direct sunlight, verify seal integrity, and confirm expiry date before
          every screening session. Follow sterile handling instructions exactly for accurate outcomes.
        </Text>
      </Card>
    </ScrollView>
  );
}
