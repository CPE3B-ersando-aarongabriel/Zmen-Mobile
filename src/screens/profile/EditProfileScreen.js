import { ScrollView, Text } from "react-native";
import { useState } from "react";

import Card from "../../components/Card";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";

export default function EditProfileScreen() {
  const [form, setForm] = useState({
    name: "Aaron D.",
    email: "aaron@zmen.health",
    age: "31",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-10 pt-6"
    >
      <SectionHeader
        title="Edit Profile"
        subtitle="Keep your information updated"
      />

      <Card elevated>
        <InputField
          label="Full name"
          placeholder="Enter name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <InputField
          label="Email"
          placeholder="Enter email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
        />
        <InputField
          label="Age"
          placeholder="Enter age"
          value={form.age}
          onChangeText={(value) => updateField("age", value)}
          keyboardType="number-pad"
        />
        <PrimaryButton title="Save changes" className="mt-2" />
      </Card>

      <Text className="mt-4 text-xs text-zmen-muted">
        Personal data updates are encrypted in transit and at rest.
      </Text>
    </ScrollView>
  );
}
