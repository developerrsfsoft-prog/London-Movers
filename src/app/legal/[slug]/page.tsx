import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const legal: Record<string, { title: string; lead: string }> = {
  privacy: { title: "Privacy policy", lead: "Draft privacy information for London Movers. Confirm the business's actual data practices before publishing." },
  terms: { title: "Terms and conditions", lead: "Draft terms for the website. Booking terms must be supplied and approved by the business." },
  cookies: { title: "Cookie policy", lead: "Draft cookie information. Review the actual website technologies and consent requirements before publishing." },
};

export function generateStaticParams() { return Object.keys(legal).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return legal[slug] ? { title: legal[slug].title, description: legal[slug].lead } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legal[slug];
  if (!page) notFound();
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / {page.title}</div><div className="eyebrow">Legal information</div><h1>{page.title}</h1><p>{page.lead}</p></div></section><section className="section"><div className="container content-wrap"><div className="status-message">Frontend draft only — this is not legal advice. The business must review this page against its actual services, data processing, terms and applicable requirements before launch.</div><h2>Information to confirm</h2><ul><li>Business identity, address and contact information</li><li>Information collected and the purposes for using it</li><li>How enquiries and customer information are stored and retained</li><li>Who can access the information and any processors involved</li><li>Cookies, analytics and third-party services in use</li><li>Customer rights and how to contact the business with a request</li><li>Booking, payment, cancellation and service terms supplied by the business</li></ul></div></section></>;
}
