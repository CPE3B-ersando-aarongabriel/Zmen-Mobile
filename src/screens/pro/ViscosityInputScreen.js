import Slider from "@react-native-community/slider";
import { ScrollView, Text, View } from "react-native";
import { useState } from "react";

import Card from "../../components/Card";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";
import { COLORS } from "../../constants";
import { analyzeProResult } from "../../services/testAnalysisService";

export default function ViscosityInputScreen({ navigation }) {
  const [ph, setPh] = useState("7.2");
  const [viscosity, setViscosity] = useState(45);
  const [motility, setMotility] = useState(62);

  const onContinue = () => {
    const result = analyzeProResult({
      ph: Number(ph || 7.2),
      viscosity,
      motility,
    });

    navigation.navigate("ProResults", { result });
  };

  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="px-5 pb-10 pt-6">
      <SectionHeader title="Viscosity Input" subtitle="Manual factors for final PRO scoring" />

      <Card elevated>
        <InputField
          label="pH value"
          value={ph}
          placeholder="e.g. 7.2"
          keyboardType="decimal-pad"
          onChangeText={setPh}
        />

        <View className="mb-5">
          <Text className="text-sm font-semibold text-zmen-text">Viscosity ({viscosity})</Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            value={viscosity}
            onValueChange={setViscosity}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.muted}
            thumbTintColor={COLORS.secondary}
          />
        </View>

        <View className="mb-2">
          <Text className="text-sm font-semibold text-zmen-text">Motility ({motility})</Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            value={motility}
            onValueChange={setMotility}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.muted}
            thumbTintColor={COLORS.secondary}
          />
        </View>

        <PrimaryButton title="Generate PRO Results" className="mt-3" onPress={onContinue} />
      </Card>
    </ScrollView>
  );
}
