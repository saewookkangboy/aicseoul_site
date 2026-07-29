const WEAK = new Set([
  "ChangeMeNow!1",
  "password",
  "Password1!",
  "12345678",
  "123456789012",
  "adminadmin12",
]);

export function isWeakSeedPassword(password: string): boolean {
  if (password.length < 12) return true;
  return WEAK.has(password);
}

export function assertStrongSeedPassword(password: string): void {
  if (isWeakSeedPassword(password)) {
    throw new Error(
      "SUPERADMIN_SEED_PASSWORD must be at least 12 chars and not a known-weak value",
    );
  }
}

export function warnIfWeakSeedPasswordInProduction(): void {
  if (process.env.NODE_ENV !== "production") return;
  const pwd = process.env.SUPERADMIN_SEED_PASSWORD;
  if (!pwd) return;
  if (isWeakSeedPassword(pwd)) {
    console.warn(
      "[security] SUPERADMIN_SEED_PASSWORD looks weak or too short; rotate SuperAdmin passwords and remove seed secret from long-lived env.",
    );
  }
}
