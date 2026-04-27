import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROUTE_ICON_MAP = {
  Home: "home",
  History: "time",
  Profile: "person",
};

export default function BottomNavBar({ state, descriptors, navigation }) {
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="bg-zmen-background px-5 pb-2 pt-3"
    >
      <View className="flex-row items-center rounded-3xl border border-zmen-muted/30 bg-zmen-white px-2 py-2 shadow-sm shadow-zmen-primary/10">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const iconName = ROUTE_ICON_MAP[route.name] || "ellipse";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              className="flex-1 items-center justify-center rounded-2xl py-2"
              onPress={onPress}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={isFocused ? "#080890" : "#8B92A7"}
              />
              <Text
                className={`mt-1 text-xs font-semibold ${
                  isFocused ? "text-zmen-primary" : "text-zmen-muted"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
