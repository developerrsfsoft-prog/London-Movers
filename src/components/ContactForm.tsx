"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, privacy: true }),
      });
      const result = await response.json() as { reference?: string; error?: string; emailConfigured?: boolean; emailSent?: boolean };
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      setReference(result.reference || "");
      setEmailNotice(result.emailSent
        ? "A confirmation email has been sent."
        : result.emailConfigured
          ? "Your message is saved, but email notifications could not be sent automatically."
          : "Your message is saved. Automatic email confirmation is not configured yet.");
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send your message.");
    } finally {
      setBusy(false);
    }
  };
  if (submitted) return <div className="status-message" role="status">Thank you. Your message has been received. Reference: <b>{reference}</b><br />{emailNotice}</div>;
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-grid">
      <div className="field"><label htmlFor="contact-name">Your name</label><input id="contact-name" required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></div>
      <div className="field"><label htmlFor="contact-email">Email address</label><input id="contact-email" type="email" required value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></div>
      <div className="field full"><label htmlFor="contact-message">How can we help?</label><textarea id="contact-message" required value={values.message} onChange={(event) => setValues({ ...values, message: event.target.value })} /></div>
      <div className="full"><label className="check-field"><input type="checkbox" required /> I agree to be contacted about this enquiry.</label></div>
      {error && <p className="error-message full" role="alert">{error}</p>}
      <div className="full"><button className="button" disabled={busy}>{busy ? "Sending…" : "Send message"} <span>↗</span></button></div>
    </div>
  </form>;
}
