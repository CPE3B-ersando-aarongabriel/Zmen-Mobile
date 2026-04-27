import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import ScannerFrame from "../../components/ScannerFrame";
import SectionHeader from "../../components/SectionHeader";
import { useCameraScanner } from "../../hooks/useCameraScanner";

export default function SemenScanScreen({ navigation }) {
  const { isScanning, startScanner, stopScanner, mockCapture, capturedUri } = useCameraScanner();

  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="px-5 pb-10 pt-6">
      <SectionHeader title="Semen Scan" subtitle="Image capture with AI analysis overlay" />

      <Card elevated>
        <View className="relative">
          <ScannerFrame label={isScanning ? "AI overlay active" : "Ready for sample image"} />
          {isScanning ? (
            <View className="absolute bottom-4 left-4 right-4 rounded-xl bg-zmen-primary/90 px-3 py-2">
              <Text className="text-xs font-semibold text-white">Analyzing edges and texture markers...</Text>
            </View>
          ) : null}
        </View>

        <Text className="mt-3 text-xs text-zmen-muted">Captured: {capturedUri || "No capture yet"}</Text>

        <View className="mt-4 gap-3">
          <PrimaryButton
            title={isScanning ? "Stop Analysis Mode" : "Start Analysis Mode"}
            variant="secondary"
            onPress={isScanning ? stopScanner : startScanner}
          />
          <PrimaryButton title="Capture Sample" onPress={mockCapture} disabled={!isScanning} />
          <PrimaryButton
            title="Next: Viscosity Input"
            variant="ghost"
            className="border-zmen-primary"
            disabled={!capturedUri}
            onPress={() => navigation.navigate("ViscosityInput")}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
