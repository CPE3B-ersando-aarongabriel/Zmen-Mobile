import { Pressable, ScrollView, Text, View } from "react-native";
import { useMemo, useState } from "react";

import Card from "../../components/Card";
import InputField from "../../components/InputField";
import SectionHeader from "../../components/SectionHeader";

const MOCK_HISTORY = [
  {
    id: "1",
    flow: "URO",
    title: "Hydration + symptom scan",
    result: "Medium",
    date: "2026-04-12",
  },
  {
    id: "2",
    flow: "PRO",
    title: "Semen capture analysis",
    result: "Low",
    date: "2026-04-10",
  },
  {
    id: "3",
    flow: "CARE",
    title: "Care planning review",
    result: "Info",
    date: "2026-04-08",
  },
  {
    id: "4",
    flow: "URO",
    title: "Urine strip follow-up",
    result: "High",
    date: "2026-03-29",
  },
];

const FILTERS = ["All", "URO", "PRO", "CARE"];

export default function HistoryListScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return MOCK_HISTORY.filter((item) => {
      const byFilter = activeFilter === "All" || item.flow === activeFilter;
      const bySearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.result.toLowerCase().includes(search.toLowerCase());

      return byFilter && bySearch;
    });
  }, [activeFilter, search]);

  return (
    <ScrollView
      className="flex-1 bg-zmen-background"
      contentContainerClassName="px-5 pb-28 pt-6"
    >
      <SectionHeader
        title="History"
        subtitle="Filter and review all screening events"
      />

      <InputField
        label="Search"
        placeholder="Search by title or result"
        value={search}
        onChangeText={setSearch}
      />

      <View className="mb-4 flex-row flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Pressable
            key={filter}
            className={`rounded-full border px-4 py-2 ${
              activeFilter === filter
                ? "border-zmen-primary bg-zmen-primary"
                : "border-zmen-muted/30 bg-zmen-white"
            }`}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === filter ? "text-white" : "text-zmen-text"
              }`}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-3">
        {filteredItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate("HistoryDetail", { item })}
          >
            <Card>
              <Text className="text-xs font-semibold tracking-wide text-zmen-primary">
                {item.flow}
              </Text>
              <Text className="mt-1 text-base font-semibold text-zmen-text">
                {item.title}
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-zmen-muted">{item.date}</Text>
                <Text className="text-sm font-semibold text-zmen-text">
                  {item.result}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}

        {!filteredItems.length ? (
          <Card>
            <Text className="text-center text-sm text-zmen-muted">
              No records match your selected filter.
            </Text>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}
