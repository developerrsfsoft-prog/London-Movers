import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/lib/database";
import { sendEnquiryEmails } from "@/lib/enquiryEmail";

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid enquiry details." }, { status: 400 });
  const data = body as Record<string, unknown>;
  if (typeof data.name !== "string" || !data.name.trim() || data.name.length > 200 ||
      typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254 ||
      typeof data.message !== "string" || !data.message.trim() || data.message.length > 4000 ||
      data.privacy !== true) {
    return NextResponse.json({ error: "Enter your name, a valid email address, a message and privacy consent." }, { status: 400 });
  }
  try {
    const enquiry = createEnquiry("contact", { name: data.name.trim(), email: data.email.trim(), message: data.message.trim() });
    const email = await sendEnquiryEmails(enquiry.reference, { name: data.name.trim(), email: data.email.trim(), message: data.message.trim() }, "contact");
    return NextResponse.json({ reference: enquiry.reference, emailConfigured: email.configured, emailSent: email.sent }, { status: 201 });
  } catch (error) {
    console.error("Unable to process contact enquiry", { error });
    return NextResponse.json({ error: "We could not process your message right now. Please try again or email us." }, { status: 500 });
  }
}
