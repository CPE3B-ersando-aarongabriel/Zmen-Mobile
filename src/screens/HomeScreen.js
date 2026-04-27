import { ScrollView, Text, View } from "react-native";

import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import SectionHeader from "../components/SectionHeader";
import { TYPOGRAPHY } from "../constants";

const FLOW_OPTIONS = [
  {
    key: "URO",
    title: "ZMEN URO",
    subtitle: "Urine-focused guided screening",
    route: "UroFlow",
    screen: "FormSelection",
  },
  {
    key: "PRO",
    title: "ZMEN PRO",
    subtitle: "Reproductive health sample analysis",
    route: "ProFlow",
    screen: "PhStripScan",
  },
  {
    key: "CARE",
    title: "ZMEN CARE",
    subtitle: "Education, care plans, and doctor support",
    route: "CareFlow",
    screen: "CareOverview",
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-28 pt-6"
    >
      <Text className={TYPOGRAPHY.display}>ZMEN Health Screening</Text>
      <Text className="mt-2 text-base leading-6 text-zmen-text/75">
        Guided, clinical-style journeys designed for trust, clarity, and fast
        action.
      </Text>

      <View className="mt-7">
        <SectionHeader
          title="Start A Screening Flow"
          subtitle="Choose one path below and follow each step"
        />

        <View className="gap-4">
          {FLOW_OPTIONS.map((item) => (
            <Card key={item.key} elevated>
              <Text className="text-xl font-bold text-zmen-primary">
                {item.title}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-zmen-text/80">
                {item.subtitle}
              </Text>
              <PrimaryButton
                title="Start Flow"
                className="mt-4"
                onPress={() =>
                  navigation.navigate(item.route, { screen: item.screen })
                }
              />
            </Card>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Clinical Progress"
          subtitle="Your latest summary"
        />
        <Card>
          <Text className="text-sm font-semibold text-zmen-muted">
            Last session
          </Text>
          <Text className="mt-2 text-lg font-semibold text-zmen-text">
            URO - Medium attention
          </Text>
          <Text className="mt-1 text-sm text-zmen-text/75">
            Repeat in 7 days and review hydration metrics.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
