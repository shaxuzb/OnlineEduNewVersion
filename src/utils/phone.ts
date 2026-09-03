const UZ_PHONE_DIGITS = 9;

/** Keeps the Uzbekistan country prefix and formats the local number for display. */
export function formatUzbekPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localDigits = (digits.startsWith("998") ? digits.slice(3) : digits).slice(
    0,
    UZ_PHONE_DIGITS,
  );
  const groups = [
    localDigits.slice(0, 2),
    localDigits.slice(2, 5),
    localDigits.slice(5, 7),
    localDigits.slice(7, 9),
  ].filter(Boolean);

  return groups.length > 0 ? `+998 ${groups.join(" ")}` : "+998";
}

/** Converts a formatted Uzbekistan phone number to the API format. */
export function normalizeUzbekPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localDigits = (digits.startsWith("998") ? digits.slice(3) : digits).slice(
    0,
    UZ_PHONE_DIGITS,
  );

  return `+998${localDigits}`;
}

export function isCompleteUzbekPhone(value: string): boolean {
  return normalizeUzbekPhone(value).length === 13;
}
