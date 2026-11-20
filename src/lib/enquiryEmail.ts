import nodemailer from "nodemailer";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function detailRows(data: Record<string, unknown>) {
  return Object.entries(data)
    .filter(([key, value]) => key !== "website" && value !== "" && value !== false && value !== null && value !== undefined)
    .map(([key, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e1e6df">${escapeHtml(key.replace(/([A-Z])/g, " $1"))}</th><td style="padding:8px;border-bottom:1px solid #e1e6df">${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</td></tr>`)
    .join("");
}

export function emailIsConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.MAIL_FROM && process.env.ENQUIRY_TO);
}

export async function sendEnquiryEmails(reference: string, data: Record<string, unknown>, kind: string) {
  if (!emailIsConfigured()) return { configured: false, sent: false };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  const recipient = String(data.email || "");
  const name = escapeHtml(data.name || "there");
  const rows = detailRows(data);
  const table = `<table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table>`;
  const common = `<p>Enquiry reference: <strong>${escapeHtml(reference)}</strong></p>${table}`;
  const adminEmail = transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.ENQUIRY_TO,
    subject: `${kind === "quote" ? "New quote request" : "New contact enquiry"} · ${reference}`,
    text: `${kind} enquiry ${reference}\n\n${Object.entries(data).map(([key, value]) => `${key}: ${String(value)}`).join("\n")}`,
    html: `<div style="font:15px/1.6 Arial,sans-serif;color:#17251f"><h1 style="color:#103b30">${kind === "quote" ? "New quote request" : "New contact enquiry"}</h1>${common}</div>`,
  });
  const customerEmail = transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: `We received your enquiry · ${reference}`,
    text: `Hello ${String(data.name || "there")},\n\nWe have received your enquiry. Your reference is ${reference}. The team will review your details and follow up.\n\nLondon Movers`,
    html: `<div style="font:15px/1.7 Arial,sans-serif;color:#17251f"><h1 style="color:#103b30">Thank you, ${name}</h1><p>We have received your enquiry and the team will review your details.</p><p>Your reference is <strong>${escapeHtml(reference)}</strong>.</p><p>Please keep this reference if you contact us about your request.</p><p>London Movers</p></div>`,
  });
  const results = await Promise.allSettled([adminEmail, customerEmail]);
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length) {
    console.error("Enquiry email delivery failed", { reference, failed: failed.length });
    return { configured: true, sent: false };
  }
  return { configured: true, sent: true };
}
