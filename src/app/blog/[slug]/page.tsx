import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "../../../../data";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return article ? { title: article.title, description: article.summary } : {};
}

export default async function BlogArticle({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {article.title}</div><div className="eyebrow">Moving advice</div><h1>{article.title}</h1><p>{article.summary}</p></div></section><article className="section"><div className="container content-wrap"><p>Use this advice as a practical starting point. Each move has different access, timing and household requirements, so adapt the steps and confirm arrangements with the people involved.</p><h2>Make a simple plan</h2><ul><li>Write down your key dates, addresses and people to contact.</li><li>List furniture, boxes and belongings that may need extra care.</li><li>Check stairs, lifts, parking, loading access and building rules.</li><li>Identify items you need to keep close on moving day.</li><li>Share important details when requesting a quotation.</li></ul><h2>Prepare your belongings</h2><p>Pack room by room, label boxes clearly and keep fragile belongings protected. Set aside documents, keys and everyday essentials so they are easy to find.</p><h2>Review your arrangements</h2><p>Check what is included in any quotation and written booking confirmation. Ask about access, changes and cancellation terms before agreeing to a move.</p><div className="quote-banner" style={{ marginTop: 30 }}><div><h2>Planning your next move?</h2><p>Share your requirements and ask about availability.</p></div><Link className="button" href="/quote">Request a quote <span>↗</span></Link></div></div></article></>;
}
