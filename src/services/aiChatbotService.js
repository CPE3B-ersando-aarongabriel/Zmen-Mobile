const KEYWORD_RESPONSES = {
  uro: "For ZMEN URO, complete hydration and morning sample timing improve consistency.",
  pro: "For ZMEN PRO, keep sample handling sterile and follow strip exposure timing exactly.",
  care: "ZMEN CARE can guide next steps and when to consult a specialist.",
  risk: "Risk labels are decision support, not diagnosis. Please consult a clinician for confirmation.",
};

export async function askAiChatbot(message) {
  const normalized = String(message || "").toLowerCase();
  const matched = Object.entries(KEYWORD_RESPONSES).find(([keyword]) =>
    normalized.includes(keyword),
  );

  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    id: Date.now().toString(),
    role: "assistant",
    content:
      matched?.[1] ||
      "I can help with URO, PRO, CARE, and interpreting your screening flow step-by-step.",
    timestamp: new Date().toISOString(),
  };
}
