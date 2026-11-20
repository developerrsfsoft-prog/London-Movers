import { NextResponse } from "next/server";
import { adminCredentialsConfigured, getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({
    configured: adminCredentialsConfigured(),
    authenticated: Boolean(session),
    email: session?.email || null,
  });
}
