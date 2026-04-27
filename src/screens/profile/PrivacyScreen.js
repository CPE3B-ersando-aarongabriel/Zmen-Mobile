import { ScrollView, Text } from "react-native";

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

export default function PrivacyScreen() {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="Privacy"
        subtitle="How we handle your health data"
      />

      <Card elevated>
        <Text className="text-sm leading-7 text-zmen-text/80">
          ZMEN stores your screening history securely and only uses it to
          improve your care experience. Sensitive health records remain private,
          and access is role-based with strict audit controls.
        </Text>
      </Card>
    </ScrollView>
  );
}
