export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";
export const sourceLocale: Locale = "ko";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_HEADER = "x-next-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "ko" || value === "en";
}
