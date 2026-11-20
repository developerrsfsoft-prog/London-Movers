import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "../../../data";

export const metadata: Metadata = { title: "London moving blog", description: "Moving advice and planning articles for homes and businesses preparing to move in London." };

export default function BlogPage() {
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / Blog</div><div className="eyebrow">London Movers blog</div><h1>Ideas and advice for your next move</h1><p>Browse practical articles for planning a home or business move. Guides are general information; confirm arrangements for your own circumstances.</p></div></section><section className="section"><div className="container"><div className="guide-grid">{articles.map((article, index) => <article className="guide-card" key={article.slug}><div className="guide-num">0{index + 1}</div><h3>{article.title}</h3><p>{article.summary}</p><Link href={`/blog/${article.slug}`}>Read article ↗</Link></article>)}</div></div></section></>;
}
