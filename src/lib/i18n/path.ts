import { defaultLocale, isLocale, type Locale, locales } from "./config";

/** `/meetups` or `/ko/meetups` → `/meetups` */
export function stripLocalePath(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length >= 2 && isLocale(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

/** Current path with locale swapped: `/ko/meetups` + `en` → `/en/meetups` */
export function swapLocalePath(pathname: string, locale: Locale): string {
  const bare = stripLocalePath(pathname);
  if (bare === "/") return `/${locale}`;
  return `/${locale}${bare}`;
}

/** Prefix a site-relative path with locale: `/meetups` → `/en/meetups` */
export function localizedPath(locale: Locale, path: string): string {
  if (!path || path === "/") return `/${locale}`;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("mailto:")) {
    return path;
  }
  const bare = path.startsWith("/") ? path : `/${path}`;
  const stripped = stripLocalePath(bare);
  if (stripped === "/") return `/${locale}`;
  return `/${locale}${stripped}`;
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}

export function hasLocalePrefix(pathname: string): boolean {
  const segment = pathname.split("/")[1];
  return locales.includes(segment as Locale);
}
