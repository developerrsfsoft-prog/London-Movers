import { NextRequest, NextResponse } from "next/server";
import { adminCredentialsConfigured, establishAdminSession, verifyAdminCredentials } from "@/lib/adminAuth";

const attempts = new Map<string, { count: number; since: number }>();
const maxAttempts = 8;
const windowMs = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!adminCredentialsConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server." }, { status: 503 });
  }
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(forwardedFor);
  if (current && now - current.since < windowMs && current.count >= maxAttempts) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024) {
    return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 400 });
  }
  if (!verifyAdminCredentials(email, password)) {
    attempts.set(forwardedFor, current && now - current.since < windowMs ? { count: current.count + 1, since: current.since } : { count: 1, since: now });
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  attempts.delete(forwardedFor);
  const secureRequest = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  await establishAdminSession(email.trim().toLowerCase(), secureRequest);
  return NextResponse.json({ authenticated: true });
}
