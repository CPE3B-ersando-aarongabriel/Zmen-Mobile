import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import ScannerFrame from "../../components/ScannerFrame";
import SectionHeader from "../../components/SectionHeader";
import { useCameraScanner } from "../../hooks/useCameraScanner";
import { analyzeUroResult } from "../../services/testAnalysisService";

export default function ScanUrineScreen({ navigation, route }) {
  const { formData } = route.params || {};
  const {
    hasPermission,
    isScanning,
    capturedUri,
    requestPermission,
    startScanner,
    stopScanner,
    mockCapture,
  } = useCameraScanner();

  const onAnalyze = () => {
    const result = analyzeUroResult({
      hydration: Number(formData?.hydration || 50),
      frequency: 60,
      discomfort: formData?.symptoms ? 70 : 45,
    });

    navigation.navigate("UroResults", { result });
  };

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="Scan Urine Sample"
        subtitle="Align strip and capture in stable lighting"
      />

      <Card elevated>
        <ScannerFrame
          label={isScanning ? "Scanner active" : "Align strip inside guide"}
        />

        <View className="mt-4 rounded-2xl bg-zmen-background p-3">
          <Text className="text-sm font-semibold text-zmen-text">
            Permission: {hasPermission ? "Granted" : "Required"}
          </Text>
          <Text className="mt-1 text-xs text-zmen-muted">
            Captured: {capturedUri || "No image"}
          </Text>
        </View>

        <View className="mt-4 gap-3">
          {!hasPermission ? (
            <PrimaryButton
              title="Grant Camera Access"
              onPress={requestPermission}
            />
          ) : null}
          <PrimaryButton
            title={isScanning ? "Stop Scanner" : "Start Scanner"}
            variant="secondary"
            onPress={isScanning ? stopScanner : startScanner}
            disabled={!hasPermission}
          />
          <PrimaryButton
            title="Capture Sample"
            onPress={mockCapture}
            disabled={!isScanning}
          />
          <PrimaryButton
            title="Analyze Result"
            variant="ghost"
            className="border-zmen-primary"
            onPress={onAnalyze}
            disabled={!capturedUri}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
