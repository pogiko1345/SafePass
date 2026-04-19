export const normalizePhilippineMobileNumber = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  const digits = rawValue.replace(/\D/g, "");

  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^639\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;

  return rawValue;
};

export const isValidPhilippineMobileNumber = (value = "") =>
  /^09\d{9}$/.test(normalizePhilippineMobileNumber(value));

export const PHILIPPINE_MOBILE_NUMBER_MESSAGE =
  "Enter a valid Philippine mobile number, e.g. 09123456789 or +639123456789.";
