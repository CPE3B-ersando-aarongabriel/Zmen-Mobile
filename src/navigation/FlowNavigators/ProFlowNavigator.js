import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../../constants";
import PhStripScanScreen from "../../screens/pro/PhStripScanScreen";
import ProResultsScreen from "../../screens/pro/ProResultsScreen";
import SemenScanScreen from "../../screens/pro/SemenScanScreen";
import ViscosityInputScreen from "../../screens/pro/ViscosityInputScreen";

const Stack = createNativeStackNavigator();

export default function ProFlowNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PhStripScan"
      screenOptions={{
        headerTintColor: COLORS.primary,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="PhStripScan"
        component={PhStripScanScreen}
        options={{ title: "pH Strip" }}
      />
      <Stack.Screen
        name="SemenScan"
        component={SemenScanScreen}
        options={{ title: "Semen Scan" }}
      />
      <Stack.Screen
        name="ViscosityInput"
        component={ViscosityInputScreen}
        options={{ title: "Viscosity" }}
      />
      <Stack.Screen
        name="ProResults"
        component={ProResultsScreen}
        options={{ title: "PRO Results" }}
      />
    </Stack.Navigator>
  );
}
