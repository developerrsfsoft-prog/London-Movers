"use client";

import Link from "next/link";
import { useState } from "react";
import { locations, regions, services } from "../../data";

const serviceCategories = ["Residential", "Commercial", "Transport", "Packing", "Furniture", "Storage", "Specialist", "Additional"];
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <div className="topline">
        <div className="container topline-inner">
          <span className="topline-location"><i className="status-dot" /> London area enquiries</span>
          <div className="topline-right">
            {contactPhone
              ? <a className="topline-phone" href={`tel:${contactPhone}`}>☎ &nbsp;{contactPhone}</a>
              : <Link className="topline-phone" href="/contact">☎ &nbsp;Call us</Link>}
            {contactEmail
              ? <a className="topline-email" href={`mailto:${contactEmail}`}>✉ &nbsp;{contactEmail}</a>
              : <Link className="topline-email" href="/contact">✉ &nbsp;Email us</Link>}
            <Link className="topline-reviews" href="/reviews">Customer feedback</Link>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="brand" href="/" aria-label="London Movers home" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 42 42"><path d="M5 22.5 21 8l16 14.5v13H24V25h-6v10.5H5z" /><path d="M29 12V6h6v11" /></svg></span>
            <span className="brand-copy"><b>London<span>Movers</span></b><small>MOVE WITH CONFIDENCE</small></span>
          </Link>
          <button className={open ? "menu-toggle is-open" : "menu-toggle"} onClick={() => { setOpen(!open); setSearchOpen(false); }} aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"}><span /><span /><span /></button>
          <nav id="primary-navigation" className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <details className="nav-dropdown"><summary>Services <span>⌄</span></summary><div className="dropdown-panel services-mega"><div className="mega-menu-title"><span>THE SERVICE DIRECTORY</span><Link href="/services" onClick={() => setOpen(false)}>Explore all services ↗</Link></div><div className="mega-service-grid">{serviceCategories.map((category) => <div key={category}><b>{category}</b>{services.filter((service) => service.category === category).slice(0, 4).map((service) => <Link key={service.slug} href={`/services/${service.slug}`} onClick={() => setOpen(false)}>{service.name}</Link>)}</div>)}</div></div></details>
            <details className="nav-dropdown"><summary>London Areas <span>⌄</span></summary><div className="dropdown-panel locations-mega"><div className="mega-menu-title"><span>EXPLORE THE LONDON DIRECTORY</span><Link href="/areas-we-cover" onClick={() => setOpen(false)}>All areas ↗</Link></div><div className="mega-location-grid">{regions.map((region) => <div key={region.slug}><Link className="mega-region-link" href={`/areas-we-cover/${region.slug}`} onClick={() => setOpen(false)}>{region.name} ↗</Link>{locations.filter((area) => area.regionSlug === region.slug).map((area) => <Link key={area.slug} href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} onClick={() => setOpen(false)}>{area.name}</Link>)}</div>)}</div></div></details>
            <Link href="/about" onClick={() => setOpen(false)}>About Us</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/reviews" onClick={() => setOpen(false)}>Reviews</Link>
            <Link href="/faqs" onClick={() => setOpen(false)}>FAQ</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            <button className="nav-search-toggle" type="button" aria-label="Search London areas" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg></button>
            <Link className="button button-small nav-cta" href="/quote" onClick={() => setOpen(false)}>Get a free quote <span>↗</span></Link>
          </nav>
        </div>
        {searchOpen && <form className="nav-search-form" action="/areas-we-cover"><label htmlFor="nav-area-search">Search London regions, boroughs and neighbourhoods</label><div><input id="nav-area-search" name="q" placeholder="Try Westminster, Wembley or Ealing" autoComplete="off" /><button className="button button-small" type="submit">Search <span>↗</span></button></div><small>Street and postcode results require a verified address dataset.</small></form>}
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link className="brand brand-light" href="/"><span className="brand-mark"><svg viewBox="0 0 42 42"><path d="M5 22.5 21 8l16 14.5v13H24V25h-6v10.5H5z" /><path d="M29 12V6h6v11" /></svg></span><span className="brand-copy"><b>London<span>Movers</span></b><small>MOVE WITH CONFIDENCE</small></span></Link>
          <p>Moving enquiries and practical planning for homes and businesses across London.</p>
          {contactPhone && <a className="footer-phone" href={`tel:${contactPhone}`}>{contactPhone} <span>↗</span></a>}
        </div>
        <div><h3>Explore</h3><Link href="/about">About us</Link><Link href="/services">Our services</Link><Link href="/areas-we-cover">London areas</Link>{regions.map((region) => <Link href={`/areas-we-cover/${region.slug}`} key={region.slug}>{region.name}</Link>)}<Link href="/pricing">Pricing guide</Link><Link href="/guides">Moving guides</Link><Link href="/blog">Blog</Link><Link href="/moving-checklist">Moving checklist</Link></div>
        <div><h3>Popular services</h3>{services.slice(0, 5).map((service) => <Link key={service.slug} href={`/services/${service.slug}`}>{service.name}</Link>)}</div>
        <div><h3>Get in touch</h3>{contactEmail && <a href={`mailto:${contactEmail}`}>{contactEmail}</a>}<Link href="/quote">Request a quotation</Link><Link href="/faqs">Frequently asked questions</Link><Link href="/legal/privacy">Privacy policy</Link><Link href="/legal/cookies">Cookie policy</Link><Link href="/legal/terms">Terms and conditions</Link><Link href="/accessibility">Accessibility</Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} London Movers</span><span>Company details and service availability are confirmed individually.</span></div>
    </footer>
  );
}

export function RegionLinks() {
  return <div className="region-link-grid">{regions.map((region) => <Link href={`/areas-we-cover/${region.slug}`} key={region.slug}>{region.name}<span>↗</span></Link>)}</div>;
}
