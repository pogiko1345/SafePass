export const normalizeRfidReaderInput = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");

export const describeRfidReaderInput = (value = "") => {
  const normalized = normalizeRfidReaderInput(value);
  if (!normalized) return "Waiting for card UID";
  return `${normalized.length} hex characters captured`;
};
