import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import ScannerFrame from "../../components/ScannerFrame";
import SectionHeader from "../../components/SectionHeader";

export default function PhStripScanScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="px-5 pb-10 pt-6">
      <SectionHeader title="pH Strip Scan" subtitle="First step in PRO analysis" />

      <Card elevated>
        <ScannerFrame label="Place pH strip in center area" />
        <View className="mt-4 rounded-2xl bg-zmen-background p-4">
          <Text className="text-sm font-semibold text-zmen-text">Tips</Text>
          <Text className="mt-1 text-xs leading-6 text-zmen-muted">
            Avoid glare, keep camera 10-15 cm away, and wait for stable focus before capture.
          </Text>
        </View>
        <PrimaryButton
          title="Continue To Semen Scan"
          className="mt-4"
          onPress={() => navigation.navigate("SemenScan")}
        />
      </Card>
    </ScrollView>
  );
}
