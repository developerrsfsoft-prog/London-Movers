import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { faqs } from "../../../data";
import ContactForm from "@/components/ContactForm";
import FaqSearch from "@/components/FaqSearch";

const pages: Record<string, { title: string; description: string; kicker: string }> = {
  about: { title: "Moving support with your needs in mind", description: "Learn how to plan a move, what details to share and how to ask about services and availability.", kicker: "About London Movers" },
  pricing: { title: "Moving costs and quotations", description: "Understand the details that can affect a moving quotation and request an estimate based on your own move.", kicker: "Pricing guide" },
  reviews: { title: "Customer reviews", description: "Read verified customer feedback when it has been provided and permissioned for publication.", kicker: "Customer feedback" },
  faqs: { title: "Frequently asked questions", description: "Answers to common questions about moving services, London areas, quotations and access.", kicker: "How can we help?" },
  contact: { title: "Get in touch about your move", description: "Contact London Movers with questions about moving services and your requirements.", kicker: "Contact" },
  accessibility: { title: "Accessibility statement", description: "Accessibility information for the London Movers website.", kicker: "Accessibility" },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return page ? { title: page.title, description: page.description } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = slug;
  const page = pages[key];
  if (!page) notFound();

  const breadcrumb = <div className="breadcrumbs"><Link href="/">Home</Link> / {page.title}</div>;
  if (key === "faqs") return <><section className="page-hero"><div className="container">{breadcrumb}<div className="eyebrow">{page.kicker}</div><h1>{page.title}</h1><p>{page.description}</p></div></section><section className="section"><div className="container content-wrap"><FaqSearch items={faqs} /><div className="quote-banner" style={{ marginTop: 36 }}><div><h2>Need help planning your move?</h2><p>Share your details to request an individual quotation.</p></div><Link className="button" href="/quote">Get a quote <span>↗</span></Link></div></div></section></>;

  if (key === "contact") return <><section className="page-hero"><div className="container">{breadcrumb}<div className="eyebrow">{page.kicker}</div><h1>{page.title}</h1><p>{page.description}</p></div></section><section className="section"><div className="container contact-layout"><div><h2>Talk to us about your move</h2><p>Send a message or share your moving requirements. We will follow up using the contact details you provide.</p><div className="contact-details">{process.env.NEXT_PUBLIC_CONTACT_PHONE && <p><b>Phone</b><a href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</a> </p>}{process.env.NEXT_PUBLIC_CONTACT_EMAIL && <p><b>Email</b><a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a></p>}<p><b>Coverage</b><span>London area enquiries; specific availability is confirmed individually.</span></p></div></div><ContactForm /></div></section></>;

  if (key === "reviews") return <><section className="page-hero"><div className="container">{breadcrumb}<div className="eyebrow">{page.kicker}</div><h1>{page.title}</h1><p>{page.description}</p></div></section><section className="section"><div className="container content-wrap"><div className="empty-review"><div className="service-icon">★</div><h2>4.9/5 on Google</h2><p>Customer satisfaction rating supplied from Google. Individual review excerpts are not displayed here.</p></div></div></section></>;

  if (key === "accessibility") return <><section className="page-hero"><div className="container">{breadcrumb}<div className="eyebrow">{page.kicker}</div><h1>{page.title}</h1><p>Draft website information — review and customise this page to match the business before publication.</p></div></section><section className="section"><div className="container content-wrap"><div className="status-message">This is a frontend content draft. Review it against the published website and the actual business before launch.</div><h2>Accessibility feedback</h2><p>If you encounter an accessibility barrier, contact the business using the details on the contact page and describe the page and issue.</p></div></section></>;

  const sections: Record<string, { title: string; text: string }[]> = {
    about: [
      { title: "A clear start to your move", text: "Planning a move involves more than transport. Access, timing, inventory and the needs of everyone involved all play a part. This website helps you organise those details and make an enquiry." },
      { title: "What to include", text: "Share both postcodes, property type, floors, stairs, lift and parking information, a useful inventory and your preferred moving date." },
      { title: "A note about company information", text: "No verified company history, accreditations or insurance details have been supplied. We do not make those claims on this website." },
    ],
    pricing: [
      { title: "Every move is different", text: "A quotation depends on the work involved. Property size, inventory, route, access, packing requirements, specialist items, date and storage needs may all affect arrangements." },
      { title: "How to get an individual quotation", text: "Provide clear pickup and destination details, list belongings and describe access. The requested services and date can then be reviewed before a quotation is discussed." },
      { title: "No unverified prices", text: "This website does not display fixed rates, minimum fees or price guarantees. Confirm all costs and inclusions in writing before booking." },
    ],
  };
  return <><section className="page-hero"><div className="container">{breadcrumb}<div className="eyebrow">{page.kicker}</div><h1>{page.title}</h1><p>{page.description}</p></div></section><section className="section"><div className="container content-wrap">{sections[key]?.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}<div className="quote-banner" style={{ marginTop: 32 }}><div><h2>Planning a move?</h2><p>Share your requirements and ask about availability.</p></div><Link className="button" href="/quote">Request a quote <span>↗</span></Link></div></div></section></>;
}
