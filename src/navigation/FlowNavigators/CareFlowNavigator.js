import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../../constants";
import CareOverviewScreen from "../../screens/care/CareOverviewScreen";
import DoctorsListScreen from "../../screens/care/DoctorsListScreen";
import EducationalContentScreen from "../../screens/care/EducationalContentScreen";
import TestingKitInfoScreen from "../../screens/care/TestingKitInfoScreen";
import TipsScreen from "../../screens/care/TipsScreen";

const Stack = createNativeStackNavigator();

export default function CareFlowNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CareOverview"
      screenOptions={{
        headerTintColor: COLORS.primary,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="CareOverview"
        component={CareOverviewScreen}
        options={{ title: "ZMEN CARE" }}
      />
      <Stack.Screen
        name="EducationalContent"
        component={EducationalContentScreen}
        options={{ title: "Educational Content" }}
      />
      <Stack.Screen
        name="DoctorsList"
        component={DoctorsListScreen}
        options={{ title: "Doctors" }}
      />
      <Stack.Screen
        name="Tips"
        component={TipsScreen}
        options={{ title: "Daily Tips" }}
      />
      <Stack.Screen
        name="TestingKitInfo"
        component={TestingKitInfoScreen}
        options={{ title: "Testing Kit Info" }}
      />
    </Stack.Navigator>
  );
}
