import type { Locale } from "../config";
import { en } from "./en";
import { ko, type Messages } from "./ko";

export type { Messages };

export function getMessages(locale: Locale): Messages {
  return locale === "en" ? en : ko;
}
