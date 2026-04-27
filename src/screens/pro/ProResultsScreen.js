import { ScrollView } from "react-native";

import ResultCard from "../../components/ResultCard";
import SectionHeader from "../../components/SectionHeader";

export default function ProResultsScreen({ navigation, route }) {
  const result = route.params?.result || {
    score: 53,
    risk: "medium",
    summary: "Moderate risk markers observed.",
  };

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="PRO Results"
        subtitle="Reproductive risk support classification"
      />

      <ResultCard
        title="PRO Risk Classification"
        score={`${result.score}/100`}
        risk={result.risk}
        summary={result.summary}
        primaryAction={{
          label: "Open Care Guidance",
          onPress: () =>
            navigation.navigate("CareFlow", { screen: "CareOverview" }),
        }}
        secondaryAction={{
          label: "Retake PRO Flow",
          onPress: () => navigation.popToTop(),
        }}
      />
    </ScrollView>
  );
}
