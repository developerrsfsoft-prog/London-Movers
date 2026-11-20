import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services } from "../../../../data";
import { findRecordBySlug, getKeywordMetadata, listRecords } from "@/lib/database";
import ConversionPanel from "@/components/ConversionPanel";
import PageHeroImage from "@/components/PageHeroImage";
import { getServicePageImage } from "@/lib/pageImages";

type Props = { params: Promise<{ slug: string }> };
type ServiceRecord = { slug: string; name: string; summary: string; category: string };
export const dynamic = "force-dynamic";
function toService(value: Record<string, unknown> | null): ServiceRecord | null {
  if (!value || typeof value.slug !== "string" || typeof value.name !== "string" ||
      typeof value.summary !== "string" || typeof value.category !== "string") return null;
  return value as ServiceRecord;
}
const findService = (slug: string) => toService(findRecordBySlug("services", slug));

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};
  const keyword = getKeywordMetadata(`/services/${slug}`);
  return {
    title: keyword?.seoTitle || `${service.name} in London`,
    description: keyword?.metaDescription || `${service.summary} Request an individual quotation for ${service.name.toLowerCase()} in London.`,
    alternates: { canonical: `/services/${service.slug}` },
    robots: { index: keyword ? keyword.indexStatus === "Index" : false, follow: true },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();
  const heroImage = getServicePageImage(service.slug);
  const related = listRecords("services", "", 1, 500).records
    .map((record) => toService(record))
    .filter((item): item is ServiceRecord => Boolean(item && item.slug !== service.slug))
    .slice(0, 4);
  return <>
    <section className="page-hero page-hero-with-image"><PageHeroImage image={heroImage} missingLabel={`No verified service photo is available for ${service.name} yet.`} /><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.name}</div><div className="eyebrow">Moving services in London</div><h1>{service.name} in London</h1><p>{service.summary} Share your route, inventory and access details to request an individual quotation.</p><div className="hero-actions page-hero-actions"><Link className="button" href="/quote">Request a quote <span>↗</span></Link><Link className="button button-outline" href="/services">Explore services</Link></div></div></section>
    <section className="section"><div className="container detail-layout"><article className="content-wrap detail-content"><div className="status-message">This is a service enquiry page. Availability and handling capability must be confirmed before a booking.</div>
      <h2>Plan the right arrangements</h2><p>Every move is different. Let us know what needs to be moved, where it is going and what matters most to you. Include your preferred date, property details and access information so your request can be reviewed.</p>
      <h2>Details to include</h2><ul><li>Pickup and destination postcodes</li><li>Property type, floors, stairs and lift access</li><li>A list of belongings and approximate quantities</li><li>Parking, loading distance and building restrictions</li><li>Preferred date and any flexibility</li><li>Any fragile, heavy or specialist items</li></ul>
      <h2>What happens next?</h2><p>After you share your requirements, the details can be checked and availability discussed. Review the proposed arrangements and quotation before confirming a booking. An enquiry is not a booking confirmation.</p>
      <p className="disclaimer">Service availability, inclusions, specialist capabilities and any additional costs must be confirmed directly before booking.</p>
    </article><ConversionPanel title={`Planning ${service.name.toLowerCase()}?`} description="Share a few details so your requirements can be reviewed." label="Start your quote" /></div></section>
    <section className="section section-white section-tight"><div className="container"><div className="section-head"><div><div className="kicker">Related services</div><h2>Explore other moving services</h2></div></div><div className="service-grid">{related.map((item) => <Link className="service-card" key={item.slug} href={`/services/${item.slug}`}><div className="service-icon">↗</div><h3>{item.name}</h3><p>{item.summary}</p><span className="card-arrow">↗</span></Link>)}</div></div></section>
  </>;
}
