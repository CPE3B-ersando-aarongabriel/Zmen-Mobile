import { ScrollView, Text, View } from "react-native";

import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import SectionHeader from "../../components/SectionHeader";

const DOCTORS = [
  { id: 1, name: "Dr. Maya Khan", specialty: "Urologist", distance: "1.2 km" },
  { id: 2, name: "Dr. Ethan Rao", specialty: "Andrologist", distance: "2.7 km" },
  { id: 3, name: "Dr. Laila Noor", specialty: "Reproductive Specialist", distance: "4.1 km" },
];

export default function DoctorsListScreen() {
  return (
    <ScrollView className="flex-1 bg-zmen-background" contentContainerClassName="gap-3 px-5 pb-10 pt-6">
      <SectionHeader title="Doctors" subtitle="Trusted specialists near you" />

      {DOCTORS.map((doctor) => (
        <Card key={doctor.id} elevated>
          <Text className="text-base font-semibold text-zmen-text">{doctor.name}</Text>
          <Text className="mt-1 text-sm text-zmen-muted">{doctor.specialty}</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-zmen-primary">{doctor.distance}</Text>
            <PrimaryButton title="Book" className="px-4 py-2" />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
