const STORAGE_KEY = "kupas_gemini_api_key";

export function getSavedApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  const clean = key.trim();
  if (!clean) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, clean);
}

export function getAiHeaders(): Record<string, string> {
  const key = getSavedApiKey();
  return key ? { "x-gemini-api-key": key } : {};
}
