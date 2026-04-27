import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../../screens/ProfileScreen";
import EditProfileScreen from "../../screens/profile/EditProfileScreen";
import PrivacyScreen from "../../screens/profile/PrivacyScreen";
import TermsScreen from "../../screens/profile/TermsScreen";

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ headerShown: true, title: "Privacy" }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ headerShown: true, title: "Terms" }}
      />
    </Stack.Navigator>
  );
}
