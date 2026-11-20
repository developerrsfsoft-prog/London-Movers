import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "../../../../data";
import { findRecordBySlug, getKeywordMetadata } from "@/lib/database";
import ConversionPanel from "@/components/ConversionPanel";

type Props = { params: Promise<{ slug: string }> };
type GuideRecord = { slug: string; title: string; summary: string; content?: string; status?: string };
export const dynamic = "force-dynamic";
function findGuide(slug: string): GuideRecord | null {
  const value = findRecordBySlug("guides", slug);
  if (!value || typeof value.slug !== "string" || typeof value.title !== "string" ||
      typeof value.summary !== "string" || value.status === "Draft") return null;
  return value as GuideRecord;
}

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = findGuide(slug);
  if (!article) return {};
  const keyword = getKeywordMetadata(`/guides/${slug}`);
  return {
    title: keyword?.seoTitle || article.title,
    description: keyword?.metaDescription || article.summary,
    alternates: { canonical: `/guides/${slug}` },
    ...(keyword ? { robots: { index: keyword.indexStatus === "Index", follow: true } } : {}),
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const article = findGuide(slug);
  if (!article) notFound();
  const customContent = article.content?.split(/\n{2,}/).filter(Boolean);
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/guides">Moving guides</Link> / {article.title}</div><div className="eyebrow">Moving guide</div><h1>{article.title}</h1><p>{article.summary}</p><div className="hero-actions page-hero-actions"><Link className="button" href="/quote">Plan your move <span>↗</span></Link><Link className="button button-outline" href="/guides">More guides</Link></div></div></section><section className="section"><div className="container detail-layout"><article className="content-wrap detail-content">{customContent?.length ? customContent.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <><p>A little preparation helps you keep track of decisions and discuss practical arrangements with the people involved in your move. Use this guide as a starting point and adapt it to your property, schedule and needs.</p><h2>Start with the key details</h2><ul><li>Confirm the addresses and moving date with everyone involved.</li><li>Make an inventory of furniture, boxes and items needing extra care.</li><li>Check stairs, lifts, parking, loading distance and building rules at both locations.</li><li>Set aside important documents, keys, medication and everyday essentials.</li><li>Ask about any service, access or equipment requirement before making a booking.</li></ul><h2>Before moving day</h2><p>Label boxes by room, keep fragile items clearly identified, and make sure pathways are safe and accessible. Contact building management where needed and confirm any permits or loading arrangements.</p><h2>Confirm the arrangements</h2><p>Review the written quotation and booking details. Check what is included, what is not, and how changes or cancellations are handled. Do not treat an enquiry as confirmation of a booking.</p></>}</article><ConversionPanel title="Getting ready to move?" description="Use this guide alongside a quote request to share your route, inventory and timing." label="Request a quote" /></div></section></>;
}
