import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminSession, deleteAdminSession, findAdminSession } from "./database";

export const adminCookieName = "london_admin_session";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

export function adminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || email.trim().toLowerCase() !== expectedEmail) return false;
  const salt = process.env.ADMIN_PASSWORD_SALT || "london-movers-admin-v1";
  return timingSafeEqual(scryptSync(password, salt, 64), scryptSync(expectedPassword, salt, 64));
}

export async function establishAdminSession(email: string, useSecureCookie: boolean) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + sessionLifetimeMs);
  createAdminSession(createHash("sha256").update(token).digest("hex"), email, expires.toISOString());
  (await cookies()).set(adminCookieName, token, {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: "strict",
    path: "/",
    expires,
  });
}

export async function getAdminSession() {
  const token = (await cookies()).get(adminCookieName)?.value;
  if (!token) return null;
  return findAdminSession(createHash("sha256").update(token).digest("hex")) || null;
}

export async function clearAdminSession() {
  const jar = await cookies();
  const token = jar.get(adminCookieName)?.value;
  if (token) deleteAdminSession(createHash("sha256").update(token).digest("hex"));
  jar.delete(adminCookieName);
}
