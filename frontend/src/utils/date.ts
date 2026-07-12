export function calculateAge(dobIso: string) {
  const dob = new Date(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString();
}

export function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0] ?? "";
}
