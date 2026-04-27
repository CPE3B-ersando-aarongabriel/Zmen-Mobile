import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useMemo, useState } from "react";

import Card from "../../components/Card";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";
import { useTestFlow } from "../../hooks/useTestFlow";

const STEP_LABELS = ["Profile", "Symptoms", "Lifestyle"];

export default function FormSelectionScreen({ navigation }) {
  const [isAiAssistEnabled, setIsAiAssistEnabled] = useState(true);
  const [form, setForm] = useState({
    age: "",
    hydration: "",
    symptoms: "",
    medication: "",
  });

  const { step, progress, goNext, goBack, isFirstStep, isFinalStep } =
    useTestFlow(3);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(form.age.trim());
    }

    if (step === 2) {
      return Boolean(form.symptoms.trim());
    }

    return true;
  }, [form.age, form.symptoms, step]);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onContinue = () => {
    if (!isFinalStep) {
      goNext();
      return;
    }

    navigation.navigate("ScanUrine", {
      formData: form,
      aiAssist: isAiAssistEnabled,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="ZMEN URO Intake"
        subtitle="Step-by-step health context collection"
      />

      <Card elevated>
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-zmen-text">
              AI-assisted input
            </Text>
            <Text className="text-xs text-zmen-muted">
              Auto-suggests clearer symptom details
            </Text>
          </View>
          <Switch
            value={isAiAssistEnabled}
            onValueChange={setIsAiAssistEnabled}
          />
        </View>

        <View className="mb-4 h-2 overflow-hidden rounded-full bg-zmen-muted/25">
          <View
            className={`h-full bg-zmen-primary ${progress >= 34 ? "w-1/3" : "w-1/6"}`}
          />
        </View>

        <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-zmen-muted">
          Step {step} of 3 - {STEP_LABELS[step - 1]}
        </Text>

        {step === 1 ? (
          <View>
            <InputField
              label="Age"
              placeholder="Enter age"
              value={form.age}
              onChangeText={(value) => updateField("age", value)}
              keyboardType="number-pad"
            />
            <InputField
              label="Daily hydration (ml)"
              placeholder="e.g. 2200"
              value={form.hydration}
              onChangeText={(value) => updateField("hydration", value)}
              keyboardType="number-pad"
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <InputField
              label="Primary symptoms"
              placeholder="Describe discomfort, frequency, urgency..."
              value={form.symptoms}
              onChangeText={(value) => updateField("symptoms", value)}
              multiline
            />
            {isAiAssistEnabled ? (
              <View className="rounded-2xl border border-zmen-secondary/40 bg-zmen-secondary/10 p-3">
                <Text className="text-xs font-semibold text-zmen-primary">
                  AI suggestion: add onset timing and symptom intensity for
                  better scoring.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {step === 3 ? (
          <InputField
            label="Medication / supplements"
            placeholder="Optional"
            value={form.medication}
            onChangeText={(value) => updateField("medication", value)}
          />
        ) : null}

        <View className="mt-2 flex-row gap-3">
          <PrimaryButton
            title="Back"
            variant="ghost"
            className="flex-1 border-zmen-primary"
            disabled={isFirstStep}
            onPress={goBack}
          />
          <PrimaryButton
            title={isFinalStep ? "Continue To Scan" : "Next Step"}
            className="flex-1"
            disabled={!canContinue}
            onPress={onContinue}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
