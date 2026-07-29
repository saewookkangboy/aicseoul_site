/** True in Vercel/production builds. Used to fail-closed on missing prod config. */
export const isProd = process.env.NODE_ENV === "production";
