import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";

export default function CareOverviewScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="px-5 pb-10 pt-6">
      <SectionHeader title="ZMEN CARE" subtitle="Recovery, education, and follow-up support" />

      <Card elevated>
        <Text className="text-lg font-bold text-zmen-text">Your care next steps</Text>
        <Text className="mt-2 text-sm leading-6 text-zmen-text/80">
          Build confidence with structured education, practical lifestyle tips, and doctor discovery.
        </Text>

        <View className="mt-5 gap-3">
          <PrimaryButton
            title="Educational Content"
            onPress={() => navigation.navigate("EducationalContent")}
          />
          <PrimaryButton
            title="Find Doctors"
            variant="secondary"
            onPress={() => navigation.navigate("DoctorsList")}
          />
          <PrimaryButton
            title="Daily Tips"
            variant="ghost"
            className="border-zmen-primary"
            onPress={() => navigation.navigate("Tips")}
          />
          <PrimaryButton
            title="Testing Kit Info"
            variant="ghost"
            className="border-zmen-muted/40"
            onPress={() => navigation.navigate("TestingKitInfo")}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
