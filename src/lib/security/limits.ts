export const RATE = {
  contact: { limit: 5, windowMs: 10 * 60_000 },
  login: { limit: 10, windowMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000 },
  upload: { limit: 30, windowMs: 10 * 60_000 },
} as const;

export const RATE_LIMIT_MESSAGE = "잠시 후 다시 시도해 주세요.";
