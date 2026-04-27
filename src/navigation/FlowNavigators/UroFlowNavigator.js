import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../../constants";
import FormSelectionScreen from "../../screens/uro/FormSelectionScreen";
import ScanUrineScreen from "../../screens/uro/ScanUrineScreen";
import UroResultsScreen from "../../screens/uro/UroResultsScreen";

const Stack = createNativeStackNavigator();

export default function UroFlowNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="FormSelection"
      screenOptions={{
        headerTintColor: COLORS.primary,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="FormSelection"
        component={FormSelectionScreen}
        options={{ title: "URO Intake" }}
      />
      <Stack.Screen
        name="ScanUrine"
        component={ScanUrineScreen}
        options={{ title: "Scan Urine" }}
      />
      <Stack.Screen
        name="UroResults"
        component={UroResultsScreen}
        options={{ title: "URO Results" }}
      />
    </Stack.Navigator>
  );
}
