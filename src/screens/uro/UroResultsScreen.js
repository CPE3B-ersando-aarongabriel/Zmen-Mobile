import { ScrollView } from "react-native";

import ResultCard from "../../components/ResultCard";
import SectionHeader from "../../components/SectionHeader";

export default function UroResultsScreen({ navigation, route }) {
  const result = route.params?.result || {
    score: 41,
    risk: "low",
    summary: "All observed markers are stable.",
  };

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="URO Results"
        subtitle="Risk is classified into Low, Medium, or High state"
      />

      <ResultCard
        title="Urinary Risk Classification"
        score={`${result.score}/100`}
        risk={result.risk}
        summary={result.summary}
        primaryAction={{
          label: "View History",
          onPress: () => navigation.navigate("MainTabs", { screen: "History" }),
        }}
        secondaryAction={{
          label: "Retake URO Flow",
          onPress: () => navigation.popToTop(),
        }}
      />
    </ScrollView>
  );
}
