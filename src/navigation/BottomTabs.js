import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BottomNavBar from "../components/BottomNavBar";
import HomeScreen from "../screens/HomeScreen";
import HistoryNavigator from "./FlowNavigators/HistoryNavigator";
import ProfileNavigator from "./FlowNavigators/ProfileNavigator";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
