import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/lib/database";
import { emailIsConfigured, sendEnquiryEmails } from "@/lib/enquiryEmail";

const submissions = new Map<string, number[]>();
const requiredFields = ["pickupAddress", "pickupPostcode", "destinationAddress", "destinationPostcode", "pickupPremises", "destinationPremises", "propertySize", "movingDate", "name", "email", "phone"];

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const recent = (submissions.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) return NextResponse.json({ error: "Too many enquiries from this connection. Please try again later." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid enquiry details." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (typeof input.website === "string" && input.website.trim()) return NextResponse.json({ error: "Unable to accept this enquiry." }, { status: 400 });
  const data = Object.fromEntries(Object.entries(input).filter(([field]) => field !== "website"));
  if (Object.values(data).some((value) => !(typeof value === "string" || typeof value === "boolean") || (typeof value === "string" && value.length > 4000))) {
    return NextResponse.json({ error: "An enquiry field is invalid or too long." }, { status: 400 });
  }
  if (requiredFields.some((field) => typeof data[field] !== "string" || !String(data[field]).trim())) return NextResponse.json({ error: "Please complete all required enquiry fields." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email)) || String(data.email).length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (typeof data.phone !== "string" || data.phone.replace(/[^\d]/g, "").length < 7) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (data.privacy !== true) return NextResponse.json({ error: "Please agree to be contacted about this enquiry." }, { status: 400 });
  recent.push(now);
  submissions.set(key, recent);
  try {
    const enquiry = createEnquiry("quote", data);
    const email = await sendEnquiryEmails(enquiry.reference, data, "quote");
    return NextResponse.json({ reference: enquiry.reference, emailConfigured: email.configured, emailSent: email.sent }, { status: 201 });
  } catch (error) {
    console.error("Unable to process quote enquiry", { error });
    return NextResponse.json({ error: "We could not process your enquiry right now. Please try again or contact us." }, { status: 500 });
  }
}
