import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HistoryDetailScreen from "../../screens/history/HistoryDetailScreen";
import HistoryScreen from "../../screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function HistoryNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HistoryList"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}
