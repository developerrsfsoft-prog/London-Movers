import Link from "next/link";
import type { Metadata } from "next";
import ServiceExplorer from "@/components/ServiceExplorer";
import PageHeroImage from "@/components/PageHeroImage";
import { getServicePageImage } from "@/lib/pageImages";

export const metadata: Metadata = { title: "Moving services in London", description: "Explore London Movers service information and request a quotation based on your requirements." };

export default function ServicesPage() {
  return <>
    <section className="page-hero page-hero-with-image"><PageHeroImage image={getServicePageImage("house-removals", "Residential")} missingLabel="Service directory photo unavailable." /><div className="container"><div className="breadcrumbs"><a href="/">Home</a> / Services</div><div className="eyebrow">Our services</div><h1>Moving solutions for homes and businesses</h1><p>Browse moving services and share your requirements for an individual quotation. Every service is subject to confirmation before booking.</p></div></section>
    <section className="section"><div className="container"><ServiceExplorer /><p className="disclaimer" style={{ marginTop: 22 }}>Services shown here are options to enquire about, not confirmation of current availability or capability.</p></div></section>
  </>;
}
