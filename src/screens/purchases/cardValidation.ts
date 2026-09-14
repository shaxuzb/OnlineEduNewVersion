export const normalizeCardNumber = (value: string) => value.replace(/\D/g, "");

export const isValidCardNumber = (value: string) => {
  const digits = normalizeCardNumber(value);
  if (!/^\d{16}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const normalizeExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const isValidExpiry = (value: string, now = new Date()) => {
  const normalized = normalizeExpiry(value);
  const match = /^(\d{2})\/(\d{2})$/.exec(normalized);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
};
