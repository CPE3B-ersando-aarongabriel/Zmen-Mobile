import { useMemo, useState } from "react";

import { askAiChatbot } from "../services/aiChatbotService";

const STARTER_MESSAGE = {
  id: "starter",
  role: "assistant",
  content: "Hi, I am your ZMEN assistant. Ask me anything about URO, PRO, and CARE flows.",
};

export function useChatbot() {
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => !loading, [loading]);

  const sendMessage = async (content) => {
    if (!content?.trim() || !canSend) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const aiMessage = await askAiChatbot(content);
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}
