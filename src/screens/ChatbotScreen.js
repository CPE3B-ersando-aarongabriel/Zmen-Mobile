import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { TYPOGRAPHY } from "../constants";
import { useChatbot } from "../hooks/useChatbot";

export default function ChatbotScreen() {
  const { messages, loading, sendMessage } = useChatbot();
  const [draft, setDraft] = useState("");

  const onSend = async () => {
    const message = draft.trim();
    if (!message) {
      return;
    }

    setDraft("");
    await sendMessage(message);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zmen-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 px-5 pb-6 pt-4">
        <Text className={TYPOGRAPHY.H2}>ZMEN Assistant</Text>
        <Text className={TYPOGRAPHY.caption}>
          Conversational support for URO, PRO, and CARE workflows.
        </Text>

        <ScrollView
          className="mt-4 flex-1"
          contentContainerClassName="gap-3 pb-4"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <View
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "self-end border border-zmen-primary bg-zmen-primary"
                    : "self-start border border-zmen-muted/60 bg-zmen-secondary/10"
                }`}
              >
                <Text
                  className={`text-sm leading-6 ${isUser ? "text-white" : "text-zmen-text"}`}
                >
                  {message.content}
                </Text>
              </View>
            );
          })}

          {loading ? (
            <View className="self-start rounded-2xl border border-zmen-muted/60 bg-zmen-white px-4 py-2">
              <Text className="text-xs font-semibold text-zmen-primary">
                Assistant is typing...
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <InputField
          label="Message"
          placeholder="Ask about your screening steps"
          value={draft}
          onChangeText={setDraft}
        />
        <PrimaryButton title="Send" onPress={onSend} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}
