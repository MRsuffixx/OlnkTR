export function normalizeEmail(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}
