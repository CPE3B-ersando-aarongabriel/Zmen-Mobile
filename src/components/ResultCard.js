import { Text, View } from "react-native";

import { cn, COMPONENT_VARIANTS, TYPOGRAPHY } from "../constants";
import Card from "./Card";
import PrimaryButton from "./PrimaryButton";

export default function ResultCard({
  title,
  score,
  risk = "low",
  summary,
  primaryAction,
  secondaryAction,
}) {
  const riskClass =
    COMPONENT_VARIANTS.risk[risk] || COMPONENT_VARIANTS.risk.low;

  return (
    <Card elevated className="space-y-4">
      <View>
        <Text className={TYPOGRAPHY.subheading}>{title}</Text>
        <View
          className={cn(
            "mt-3 self-start rounded-full border px-3 py-1",
            riskClass,
          )}
        >
          <Text className="text-xs font-semibold uppercase tracking-wide">
            {risk} risk
          </Text>
        </View>
      </View>

      <Text className="text-4xl font-black text-zmen-primary">{score}</Text>
      <Text className="text-sm leading-6 text-zmen-text/80">{summary}</Text>

      <View className="gap-3">
        {primaryAction ? (
          <PrimaryButton
            title={primaryAction.label}
            onPress={primaryAction.onPress}
          />
        ) : null}
        {secondaryAction ? (
          <PrimaryButton
            title={secondaryAction.label}
            onPress={secondaryAction.onPress}
            variant="ghost"
            className="border-zmen-primary"
          />
        ) : null}
      </View>
    </Card>
  );
}
