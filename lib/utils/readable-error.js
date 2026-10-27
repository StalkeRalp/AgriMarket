const technicalErrorPatterns = [
  /cannot read properties/i,
  /undefined \(reading/i,
  /is not a function/i,
  /\btypeerror\b/i,
  /\breferenceerror\b/i,
  /networkerror|failed to fetch|fetch failed/i,
  /\bat\s+\w+\s+\(/i,
];

export function readableError(error, fallback = "Une erreur est survenue. Veuillez réessayer.") {
  const message = typeof error === "string" ? error : error?.message;
  if (!message || technicalErrorPatterns.some((pattern) => pattern.test(message))) return fallback;
  return message;
}
