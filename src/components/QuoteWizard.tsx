"use client";

import { FormEvent, useState } from "react";

const steps = ["Addresses", "Property", "Inventory", "Services", "Date", "Your details", "Review"];
const premisesTypes = ["House", "Flat", "Apartment", "Studio", "Shared accommodation", "Student accommodation", "Office", "Shop", "Commercial premises", "Warehouse", "Other"];
const inventoryItems = ["Boxes", "Sofas", "Beds", "Wardrobes", "Tables", "Chairs", "Cabinets", "Appliances", "Electronics", "Fragile items", "Heavy items", "Specialist items"];
const additionalServices = ["Packing", "Unpacking", "Furniture dismantling", "Furniture assembly", "Storage", "Packing materials", "Specialist handling"];

type Values = Record<string, string | boolean>;

function Field({ name, label, values, set, type = "text", options, required = false }: {
  name: string; label: string; values: Values; set: (name: string, value: string | boolean) => void; type?: string; options?: string[]; required?: boolean;
}) {
  const id = `quote-${name}`;
  if (type === "checkbox") return <label className="check-field" htmlFor={id}><input id={id} type="checkbox" required={required} checked={Boolean(values[name])} onChange={(event) => set(name, event.target.checked)} />{label}</label>;
  return <div className="field"><label htmlFor={id}>{label}{required && " *"}</label>{options ? <select id={id} required={required} value={String(values[name] || "")} onChange={(event) => set(name, event.target.value)}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input id={id} type={type} required={required} value={String(values[name] || "")} onChange={(event) => set(name, event.target.value)} />}</div>;
}

export default function QuoteWizard({ initial = {} }: { initial?: Record<string, string> }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ pickupPostcode: initial.from || "", destinationPostcode: initial.to || "", propertySize: initial.size || "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [error, setError] = useState("");
  const set = (name: string, value: string | boolean) => setValues((current) => ({ ...current, [name]: value }));
  const continueStep = () => {
    const form = document.querySelector<HTMLFormElement>(".quote-wizard");
    if (form?.reportValidity()) {
      setError("");
      setStep((current) => current + 1);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { reference?: string; error?: string; emailConfigured?: boolean; emailSent?: boolean };
      if (!response.ok) {
        setError(result.error || "We could not submit your enquiry. Please try again.");
        return;
      }
      setReference(result.reference || "");
      setEmailNotice(result.emailSent
        ? "A confirmation email has been sent to the address you provided."
        : result.emailConfigured
          ? "Your enquiry is saved, but email notifications could not be sent automatically."
          : "Your enquiry is saved. Automatic email confirmation is not configured yet.");
      setSubmitted(true);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: string, label: string, type = "text", options?: string[], required = false) => <Field key={name} name={name} label={label} type={type} options={options} values={values} set={set} required={required} />;
  const checkedGroup = (items: string[], prefix: string) => <div className="check-grid">{items.map((item) => field(`${prefix}-${item}`, item, "checkbox"))}</div>;

  if (submitted) return <div className="form-shell quote-confirmation" role="status"><div className="kicker">Enquiry received</div><h2>Thank you. Your move is in motion.</h2><p>We have saved your enquiry. Keep this reference for any follow-up with our team.</p><strong className="quote-reference">{reference}</strong><p>{emailNotice}</p><p className="disclaimer">This is an enquiry, not a confirmed booking. Availability and arrangements will be discussed with you.</p><button className="button button-outline" type="button" onClick={() => { setSubmitted(false); setStep(5); }}>Return to your details <span>↗</span></button></div>;

  return <form className="form-shell quote-wizard" onSubmit={submit}>
    <div className="quote-step-meta"><span>STEP {String(step + 1).padStart(2, "0")} <i>/ {String(steps.length).padStart(2, "0")}</i></span><div className="quote-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
    <ol className="form-steps" aria-label={`Step ${step + 1} of ${steps.length}`}>{steps.map((label, index) => <li className={index === step ? "active" : index < step ? "complete" : ""} aria-current={index === step ? "step" : undefined} key={label}><span>{index + 1}</span> {label}</li>)}</ol>
    <h2>{steps[step]}</h2>
    {error && <p className="error-message" role="alert">{error}</p>}
    {step === 0 && <div className="form-grid">
      {field("pickupAddress", "Pickup address", "text", undefined, true)}{field("pickupPostcode", "Pickup postcode", "text", undefined, true)}
      {field("destinationAddress", "Destination address", "text", undefined, true)}{field("destinationPostcode", "Destination postcode", "text", undefined, true)}
      {field("pickupPremises", "Pickup premises type", "select", premisesTypes, true)}{field("destinationPremises", "Destination premises type", "select", premisesTypes, true)}
    </div>}
    {step === 1 && <div className="form-grid">
      {field("propertySize", "Property size", "select", ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms", "Business premises"], true)}
      {field("numberOfRooms", "Number of rooms", "number")}{field("pickupFloor", "Pickup floor", "text")}{field("destinationFloor", "Destination floor", "text")}
      {field("pickupLift", "Lift at pickup", "select", ["Yes", "No", "Not sure"])}{field("destinationLift", "Lift at destination", "select", ["Yes", "No", "Not sure"])}
      {field("stairs", "Stairs or access notes", "text")}{field("parking", "Parking availability or restrictions", "text")}
      {field("loadingDistance", "Distance to loading area", "text")}{field("accessRestrictions", "Access restrictions", "text")}
    </div>}
    {step === 2 && <div><p className="section-intro">Select the main items you expect to move. Add quantities or other details in the notes.</p>{checkedGroup(inventoryItems, "inventory")}<div className="form-grid"><div className="field full"><label htmlFor="quote-inventoryNotes">Inventory notes and quantities</label><textarea id="quote-inventoryNotes" value={String(values.inventoryNotes || "")} onChange={(event) => set("inventoryNotes", event.target.value)} /></div></div></div>}
    {step === 3 && <div><p className="section-intro">Choose any additional services you would like to discuss. Availability is confirmed individually.</p>{checkedGroup(additionalServices, "service")}</div>}
    {step === 4 && <div className="form-grid">
      {field("movingDate", "Preferred moving date", "date", undefined, true)}{field("movingTime", "Preferred time", "select", ["Morning", "Afternoon", "Flexible"])}
      {field("flexibleDate", "Is your date flexible?", "select", ["Yes", "No"])}{field("urgent", "Is this an urgent enquiry?", "select", ["No", "Yes"])}
    </div>}
    {step === 5 && <div className="form-grid">
      {field("name", "Full name", "text", undefined, true)}{field("email", "Email address", "email", undefined, true)}
      {field("phone", "Phone number", "tel", undefined, true)}{field("contactMethod", "Preferred contact method", "select", ["Email", "Phone", "Either"])}
      <div className="field full"><label htmlFor="quote-additionalNotes">Anything else we should know?</label><textarea id="quote-additionalNotes" value={String(values.additionalNotes || "")} onChange={(event) => set("additionalNotes", event.target.value)} /></div>
      <div className="field" aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}><label htmlFor="quote-website">Website</label><input id="quote-website" tabIndex={-1} autoComplete="off" value={String(values.website || "")} onChange={(event) => set("website", event.target.value)} /></div>
      <div className="full"><Field name="privacy" label="I have read the privacy information and agree to be contacted about this enquiry." type="checkbox" values={values} set={set} required /></div>
    </div>}
    {step === 6 && <div className="review-grid">{Object.entries(values).filter(([key, value]) => value && key !== "website" && !key.startsWith("inventory-") && !key.startsWith("service-")).map(([key, value]) => <div className="review-item" key={key}><b>{key.replace(/([A-Z])/g, " $1").replace(/-/g, " ")}</b><span>{String(value)}</span></div>)}</div>}
    <div className="form-actions">{step > 0 ? <button className="button button-outline" type="button" onClick={() => setStep(step - 1)}>Back</button> : <span />}{step < steps.length - 1 ? <button className="button" type="button" onClick={continueStep}>Continue <span>→</span></button> : <button className="button" type="submit" disabled={submitting}>{submitting ? "Sending enquiry…" : "Submit enquiry"} <span>↗</span></button>}</div>
    <p className="disclaimer" style={{ marginTop: 16 }}>Fields marked * are required. Your enquiry is not a confirmed booking.</p>
  </form>;
}
