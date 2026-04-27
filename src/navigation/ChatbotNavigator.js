import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../constants";
import ChatbotScreen from "../screens/ChatbotScreen";

const Stack = createNativeStackNavigator();

export default function ChatbotNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: "ZMEN Assistant" }}
      />
    </Stack.Navigator>
  );
}
