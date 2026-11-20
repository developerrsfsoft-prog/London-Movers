import Link from "next/link";
import type { Metadata } from "next";
import { regions } from "../../../data";
import LocationSearch from "@/components/LocationSearch";
import { listRecords } from "@/lib/database";
import PageHeroImage from "@/components/PageHeroImage";
import { londonAreaImage } from "@/lib/pageImages";

export const metadata: Metadata = { title: "London areas we cover", description: "Browse the London area directory by region, borough and neighbourhood. Ask us to confirm service availability for your postcodes." };
export const dynamic = "force-dynamic";

export default async function AreasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const locations = listRecords("locations", "", 1, 500).records.filter((record): record is typeof record & { name: string; slug: string; regionSlug: string } =>
    typeof record.name === "string" && typeof record.slug === "string" && typeof record.regionSlug === "string");
  return <>
    <section className="page-hero page-hero-with-image"><PageHeroImage image={londonAreaImage} missingLabel="London directory photo unavailable." /><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / London areas</div><div className="eyebrow">London area directory</div><h1>Explore London, area by area</h1><p>Browse all nine website regions and 33 London authorities. Share your postcodes to check service availability for your specific move.</p></div></section>
    <section className="section section-tight"><div className="container"><LocationSearch initialQuery={q} /></div></section>
    <section className="section"><div className="container"><div className="section-head"><div><div className="kicker">Nine website regions</div><h2>Choose a London region</h2><p>These are website navigation groupings, not official geographical boundaries.</p></div></div><div className="region-link-grid">{regions.map((region) => <Link href={`/areas-we-cover/${region.slug}`} key={region.slug}>{region.name}<span>↗</span></Link>)}</div></div></section>
    <section className="section section-white"><div className="container"><div className="section-head"><div><div className="kicker">33 London authorities</div><h2>Browse by borough or City of London</h2></div></div><div className="location-grid">{locations.map((area) => <Link className="location-card" href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} key={area.slug}>{area.name}<span>↗</span></Link>)}</div></div></section>
    <section className="section section-tight"><div className="container"><div className="status-message">This directory is for browsing. It does not confirm that a service is available at every address. Coverage should be verified before booking.</div></div></section>
  </>;
}
