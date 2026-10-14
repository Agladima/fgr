/**
 * Form validation helpers for FGR Career Development Center
 */

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // RFC 5322 compliant regex for standard web email verification
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Cleans spaces, dashes, parentheses and checks for 7 to 15 digits, optionally prefixed with +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
}

export function isNonEmpty(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
