import { Pressable, ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";

const MENU_ITEMS = [
  { key: "EditProfile", title: "Edit profile" },
  { key: "Privacy", title: "Privacy policy" },
  { key: "Terms", title: "Terms and conditions" },
];

export default function ProfileMainScreen({ navigation }) {
  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-28 pt-6"
    >
      <SectionHeader
        title="Profile"
        subtitle="Manage your account and preferences"
      />

      <Card elevated>
        <Text className="text-xs font-semibold tracking-wide text-zmen-muted">
          ACCOUNT
        </Text>
        <Text className="mt-2 text-2xl font-bold text-zmen-text">Aaron D.</Text>
        <Text className="mt-1 text-sm text-zmen-text/75">
          aaron@zmen.health
        </Text>
        <View className="mt-4 rounded-2xl bg-zmen-background p-4">
          <Text className="text-sm font-semibold text-zmen-text">
            Member since
          </Text>
          <Text className="mt-1 text-sm text-zmen-muted">January 2026</Text>
        </View>
      </Card>

      <View className="mt-5 gap-3">
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => navigation.navigate(item.key)}
          >
            <Card>
              <Text className="text-base font-semibold text-zmen-text">
                {item.title}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <PrimaryButton
        title="Sign out"
        variant="ghost"
        className="mt-6 border-zmen-muted/40"
      />
    </ScrollView>
  );
}
