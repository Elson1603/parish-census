// Date-only strings ("YYYY-MM-DD") are parsed as UTC midnight per the ECMAScript
// spec, but calendar selections and display should always reflect the user's
// local calendar day. Mixing the two silently shifts the date by a day for any
// user whose timezone offset isn't zero, so every conversion below goes through
// local date components instead of toISOString()/new Date(isoString).

export function parseIsoDate(dateIso: string): Date {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function calculateAge(dobIso: string) {
  const dob = parseIsoDate(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(dateIso: string) {
  // formatDate is used for both plain dates ("dob") and full timestamps
  // ("createdAt"); only the former needs the local-date parsing above - a
  // timestamp already carries a real instant that new Date() handles correctly.
  const date = DATE_ONLY_PATTERN.test(dateIso) ? parseIsoDate(dateIso) : new Date(dateIso);
  return date.toLocaleDateString();
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
