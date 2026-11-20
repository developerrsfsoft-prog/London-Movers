import Link from "next/link";
import type { Metadata } from "next";
import { listRecords } from "@/lib/database";

export const metadata: Metadata = { title: "Moving guides and advice", description: "Practical moving checklists and advice for planning a home or business move in London." };
export const dynamic = "force-dynamic";

export default function GuidesPage() {
  const saved = listRecords("guides", "", 1, 500).records.filter((item) => item.status !== "Draft" && typeof item.slug === "string" && typeof item.title === "string" && typeof item.summary === "string");
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / Moving guides</div><div className="eyebrow">Practical moving advice</div><h1>Helpful guides for a smoother move</h1><p>Use these checklists and tips to organise access, belongings and the details that matter before moving day.</p></div></section><section className="section"><div className="container">{saved.length ? <div className="guide-grid">{saved.map((article, index) => <article className="guide-card" key={article.slug}><div className="guide-num">0{index + 1}</div><h3>{article.title}</h3><p>{article.summary}</p><Link href={`/guides/${article.slug}`}>Read the guide ↗</Link></article>)}</div> : <p className="status-message">New moving guides are being prepared.</p>}</div></section></>;
}
