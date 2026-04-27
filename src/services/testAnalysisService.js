export function classifyRisk(score) {
  if (score >= 75) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

export function analyzeUroResult({
  hydration = 50,
  frequency = 50,
  discomfort = 50,
}) {
  const weighted = hydration * 0.3 + frequency * 0.35 + discomfort * 0.35;
  const score = Math.round(weighted);
  const risk = classifyRisk(score);

  return {
    score,
    risk,
    summary:
      risk === "high"
        ? "Elevated concern indicators detected. Prompt clinical follow-up is recommended."
        : risk === "medium"
          ? "Some markers are outside ideal range. Monitor closely and repeat testing."
          : "Indicators are currently stable. Continue preventive care and hydration.",
  };
}

export function analyzeProResult({ ph = 7.2, viscosity = 50, motility = 50 }) {
  const phPenalty = Math.abs(7.4 - ph) * 20;
  const weighted = viscosity * 0.4 + motility * 0.45 + phPenalty * 0.15;
  const score = Math.min(100, Math.round(weighted));
  const risk = classifyRisk(score);

  return {
    score,
    risk,
    summary:
      risk === "high"
        ? "Multiple semen quality factors suggest further lab evaluation."
        : risk === "medium"
          ? "Some reproductive markers may need observation and repeat analysis."
          : "Core parameters look favorable based on current screening inputs.",
  };
}
