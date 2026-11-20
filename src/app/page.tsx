import Link from "next/link";
import type { Metadata } from "next";
import { articles, faqs, locations, neighbourhoodUrl, popularAreas, premises, regions, allNeighbourhoods } from "../../data";
import RegionExplorer from "@/components/RegionExplorer";
import ServiceExplorer from "@/components/ServiceExplorer";
import LocationSearch from "@/components/LocationSearch";
import { getKeywordMetadata } from "@/lib/database";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  const keyword = getKeywordMetadata("/");
  return {
    title: keyword?.seoTitle || "London Movers | Plan your next move across London",
    description: keyword?.metaDescription || "Explore London moving services and area guides. Share your requirements to request an individual moving quotation.",
    alternates: { canonical: "/" },
    robots: { index: keyword?.indexStatus !== "Noindex until verified", follow: true },
  };
}

const areaUrl = (name: string) => {
  const neighbourhood = allNeighbourhoods.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (neighbourhood) return neighbourhoodUrl(neighbourhood);
  const borough = locations.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (borough) return `/areas-we-cover/${borough.regionSlug}/${borough.slug}`;
  return "/areas-we-cover";
};

const premiseServiceRoutes: Record<string, string> = {
  Houses: "house-removals",
  Flats: "flat-removals",
  Apartments: "apartment-moving",
  "Studio apartments": "studio-removals",
  "Shared accommodation": "home-removals",
  "Student accommodation": "student-removals",
  Offices: "office-relocation",
  Shops: "shop-removals",
  "Retail units": "retail-relocation",
  Restaurants: "restaurant-removals",
  Cafes: "commercial-removals",
  Hotels: "business-relocation",
  Warehouses: "warehouse-relocation",
  Factories: "factory-relocation",
  Workshops: "factory-relocation",
  Schools: "commercial-removals",
  Colleges: "commercial-removals",
  Universities: "commercial-removals",
  Nurseries: "commercial-removals",
  "Childcare centres": "commercial-removals",
  Libraries: "commercial-removals",
  Clinics: "commercial-removals",
  "Dental practices": "commercial-removals",
  "Private practices": "commercial-removals",
  "Care homes": "commercial-removals",
  Hospitals: "commercial-removals",
  Churches: "commercial-removals",
  Mosques: "commercial-removals",
  Temples: "commercial-removals",
  Synagogues: "commercial-removals",
  "Museums and galleries": "commercial-removals",
  "Gyms and fitness studios": "commercial-removals",
  "Sports clubs": "commercial-removals",
  Theatres: "commercial-removals",
  "Council buildings": "business-relocation",
  "Government buildings": "business-relocation",
  "Police stations": "business-relocation",
  "Fire stations": "business-relocation",
  "Ambulance stations": "business-relocation",
  "Storage units": "storage-solutions",
  Garages: "commercial-removals",
  "Community centres": "commercial-removals",
  "Event venues": "commercial-removals",
  "Commercial buildings": "commercial-removals",
};

function SectionHead({ kicker, title, copy, href, link }: { kicker: string; title: string; copy: string; href?: string; link?: string }) {
  return <div className="section-head"><div><div className="kicker">{kicker}</div><h2>{title}</h2><p>{copy}</p></div>{href && <Link className="text-link" href={href}>{link || "Explore more"} <span>↗</span></Link>}</div>;
}

function QuoteBanner() {
  return <div className="quote-banner"><div><h2>Ready to make your next move?</h2><p>Tell us what you need and request an individual quotation.</p></div><Link className="button" href="/quote">Start your quote <span>↗</span></Link></div>;
}

export default function HomePage() {
  return <>
    <section className="hero">
      <div className="container hero-content">
        <div className="eyebrow">Professional moving services in London</div>
        <h1>Move anywhere in London, <em>hassle-free!</em></h1>
        <p className="hero-copy">From a studio flat to a family home or business premises, start planning your move with clear information and a quote tailored to your requirements.</p>
        <div className="hero-actions"><Link className="button" href="/quote">Get a free quote <span>↗</span></Link><Link className="button button-outline" href="/services">Explore services</Link></div>
        <div className="hero-points"><span>Moving plans built around you</span><span>Careful requirements review</span><span>Clear quotation process</span></div>
      </div>
      <div className="hero-note" aria-label="Rated 4.9 out of 5 for customer satisfaction">
        <span className="hero-note-stars" aria-hidden="true">
          <svg viewBox="0 0 120 24">
            <path d="m12 1.5 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.2 7.3-1.1z" />
            <path d="m36 1.5 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.2 7.3-1.1z" />
            <path d="m60 1.5 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.2 7.3-1.1z" />
            <path d="m84 1.5 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.2 7.3-1.1z" />
            <path d="m108 1.5 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.3-6.5-3.5-6.5 3.5 1.3-7.3-5.3-5.2 7.3-1.1z" />
          </svg>
        </span>
        <b className="hero-note-rating">4.9/5</b>
        <span className="hero-note-label">Customer satisfaction</span>
      </div>
    </section>

    <section className="trust-strip-section" aria-label="Moving support principles">
      <div className="container trust-strip">
        {[["01", "Professional support", "Clear information at every step"], ["02", "Careful planning", "Item and access details reviewed"], ["03", "Flexible timing", "Share dates and alternatives"], ["04", "Clear quotations", "Arrangements confirmed before booking"], ["05", "Helpful contact", "Questions welcome before you decide"]].map(([number, title, copy]) => <article key={number}><span>{number}</span><div><b>{title}</b><small>{copy}</small></div></article>)}
      </div>
    </section>

    <section className="section home-services">
      <div className="container">
        <SectionHead kicker="Moving services" title="Explore the right kind of moving support" copy="Browse service categories for homes, businesses, furniture and specialist-item enquiries. Every service request is subject to confirmation." href="/services" link="Open service directory" />
        <ServiceExplorer />
      </div>
    </section>

    <section className="section home-coverage">
      <div className="container coverage-panel">
        <div className="coverage-copy"><div className="kicker">London area directory</div><h2>Find your area in London</h2><p>From Central London to Greater London, browse the directory and ask us to confirm your postcodes.</p><Link className="button button-small" href="/areas-we-cover">View all London areas <span>↗</span></Link></div>
        <div className="coverage-photo" role="img" aria-label="Aerial view of London" />
        <div className="coverage-popular"><b>Popular areas</b><div>{["Central London", "West London", "East London", "North London", "South London", "Croydon", "Wembley", "Richmond", "Greenwich", "Lewisham"].map((area) => <Link href={areaUrl(area)} key={area}>{area}</Link>)}</div><p>Area directory · availability to be confirmed</p></div>
      </div>
    </section>

    <section className="section section-tight">
      <div className="container"><SectionHead kicker="Our London regions" title="One London directory, nine ways to explore" copy="Browse borough and neighbourhood directory entries by website region. These groupings help navigation and are not official boundaries or service-coverage confirmations." href="/areas-we-cover" link="View full directory" /><RegionExplorer /></div>
    </section>

    <section className="section section-white section-tight">
      <div className="container"><SectionHead kicker="Popular areas" title="Places across London" copy="Start with a popular area or browse the complete directory to find a borough and its neighbourhoods." href="/areas-we-cover" link="Browse every area" /><div className="area-cloud">{popularAreas.map((area) => <Link href={areaUrl(area)} key={area}>{area}</Link>)}</div></div>
    </section>

    <section className="section location-explorer-section">
      <div className="container location-explorer-layout">
        <div><div className="kicker">London area explorer</div><h2>Find a region, borough or neighbourhood</h2><p>Search the directory by area name. Street and postcode lookup will be added only when verified geographic data is available.</p><Link className="text-link" href="/areas-we-cover">Browse all 33 authorities <span>↗</span></Link></div>
        <LocationSearch compact />
      </div>
    </section>

    <section className="section">
      <div className="container"><SectionHead kicker="Homes, workspaces and more" title="Moving enquiries for different property types" copy="Choose a property type to explore relevant moving services. Restricted or controlled buildings require your appropriate authorisation and access permission." /><div className="premises-grid">{premises.map((item) => <Link className="premise" href={`/services/${premiseServiceRoutes[item]}`} key={item} aria-label={`Explore moving services for ${item.toLowerCase()}`}>{item}<span aria-hidden="true">↗</span></Link>)}</div></div>
    </section>

    <section className="section section-dark">
      <div className="container"><SectionHead kicker="The London Movers approach" title="A moving plan shaped around your needs" copy="Good planning starts with understanding the details. Share the practicalities and we can review what arrangements may suit your move." /><div className="why-grid">{[["Clear communication", "Know what information is needed and what happens after you send an enquiry."], ["Careful requirements review", "Share fragile, bulky or specialist belongings so they can be assessed early."], ["Flexible planning", "Include your preferred date, time window and any flexibility."], ["Upfront details", "Access, parking, stairs and lifts can all affect moving arrangements."], ["Individual quotations", "Moving costs depend on your move, rather than a made-up fixed website price."], ["Helpful next steps", "Receive an enquiry reference and use it when following up about your request."]].map(([title, copy], i) => <article className="why-card" key={title}><div className="service-icon">{["↗", "⌂", "◷", "⇅", "£", "✓"][i]}</div><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
    </section>

    <section className="section section-white section-tight">
      <div className="container"><SectionHead kicker="How it works" title="Four steps to a well-planned move" copy="A straightforward enquiry gives the team the details needed to review your moving requirements." /><div className="steps">{[["Request a quote", "Tell us where you are moving and your preferred date."], ["Share your details", "Add property access, inventory and any extra services."], ["Review arrangements", "Discuss availability and the quotation before confirming."], ["Prepare to move", "Follow the collection and delivery plan agreed with you."]].map(([title, copy]) => <article className="step" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
    </section>

    <section className="section">
      <div className="container feature-row"><div><div className="kicker">Residential moving</div><h2>Make your next home move easier to organise</h2><p className="section-intro">Moving home comes with plenty to coordinate. Whether it is a studio, flat or family house, useful details about your belongings and access help shape the right moving plan.</p><ul className="check-list"><li>House and family home moves</li><li>Flat and apartment relocations</li><li>Small property moves</li><li>Multi-bedroom homes</li><li>Collection and delivery details</li><li>Optional packing enquiries</li></ul><Link className="button" href="/services/house-removals">Explore residential moves <span>↗</span></Link></div><div className="photo-panel" role="img" aria-label="Bright, prepared home interior ready for a move"><span className="photo-panel-label">Plan around your home and belongings</span></div></div>
    </section>

    <section className="section section-white">
      <div className="container feature-row"><div className="photo-panel office" role="img" aria-label="Modern office workspace being prepared for relocation"><span className="photo-panel-label">Keep business moving with a clear plan</span></div><div><div className="kicker">Office and commercial moves</div><h2>Plan a business relocation with fewer surprises</h2><p className="section-intro">A workplace move calls for coordination. Tell us about furniture, equipment, loading arrangements and any building rules at both locations.</p><ul className="check-list"><li>Desks, chairs and filing cabinets</li><li>IT and meeting-room equipment</li><li>Retail fixtures and stock details</li><li>Access times and loading points</li><li>Move date and operational needs</li><li>Commercial premises information</li></ul><Link className="button" href="/services/office-relocation">Explore office moves <span>↗</span></Link></div></div>
    </section>

    <section className="section section-tight"><div className="container feature-row"><div><div className="kicker">Packing and unpacking</div><h2>Ask about packing support for your move</h2><p className="section-intro">If you would like help preparing your belongings, include the rooms, items and level of support you have in mind. Fragile belongings and packing materials can be noted in your enquiry.</p><ul className="check-list"><li>Full or partial packing requests</li><li>Fragile-item requirements</li><li>Kitchen and room-by-room details</li><li>Furniture protection enquiries</li><li>Packing materials requests</li><li>Unpacking assistance</li></ul><Link className="button" href="/services/packing-services">Explore packing services <span>↗</span></Link></div><div className="photo-panel pack" role="img" aria-label="Carefully packed moving boxes and household belongings"><span className="photo-panel-label">A little preparation goes a long way</span></div></div></section>

    <section className="section section-white section-tight"><div className="container"><SectionHead kicker="Furniture moving" title="Organised transport for furniture and larger items" copy="List the furniture, approximate sizes and access at each address. Tell us if an item needs dismantling, assembly or special attention." /><div className="service-grid">{["Sofas and armchairs", "Beds and wardrobes", "Dining tables and chairs", "Cabinets and bookcases", "Office furniture", "Collections and deliveries"].map((item) => <article className="service-card" key={item}><div className="service-icon">⌂</div><h3>{item}</h3><p>Include dimensions and access information when you request a quotation.</p></article>)}</div></div></section>

    <section className="section"><div className="container feature-row"><div className="photo-panel" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80)" }} role="img" aria-label="Interior furniture requiring thoughtful handling"><span className="photo-panel-label">Share the details for an assessment</span></div><div><div className="kicker">Specialist item enquiries</div><h2>Items that may need extra care</h2><p className="section-intro">Some belongings need a closer look before a move can be agreed. Describe the item, its dimensions, access and any handling guidance you know.</p><ul className="check-list"><li>Pianos and musical instruments</li><li>Antique or delicate furniture</li><li>Artwork, mirrors and glass</li><li>Safes and heavy appliances</li><li>Gym or specialist equipment</li><li>Fragile and unusual items</li></ul><p className="disclaimer">Specialist handling is subject to assessment and confirmed capability.</p></div></div></section>

    <section className="section section-white section-tight"><div className="container"><SectionHead kicker="Storage enquiries" title="Include storage in your moving plans" copy="If timing or space is a concern, mention short- or long-term storage in your enquiry. Facilities, arrangements and availability must be confirmed before booking." /><div className="service-grid">{["Short-term storage", "Long-term storage", "Furniture storage", "Household storage", "Business storage", "Moving and storage"].map((item) => <article className="service-card" key={item}><div className="service-icon">▣</div><h3>{item}</h3><p>Tell us what you need to store and for how long so options can be discussed.</p></article>)}</div></div></section>

    <section className="section"><div className="container"><SectionHead kicker="Different move combinations" title="From one kind of place to another" copy="Moves can involve different premises at either end. Describe both locations and any permissions or access arrangements required." /><div className="types-grid">{["Home to home", "Flat to apartment", "Office to office", "Shop or retail space"].map((item) => <div className="type-card" key={item}><span>{item}</span></div>)}</div><div className="area-cloud" style={{ marginTop: 16 }}>{["Residential to storage", "Storage to residential", "Business to new premises", "Other approved combinations"].map((item) => <span key={item}>{item}</span>)}</div></div></section>

    <section className="section section-white">
      <div className="container"><SectionHead kicker="London borough directory" title="Explore all 33 London authorities" copy="Browse the City of London and all 32 boroughs by their website region grouping." href="/areas-we-cover" link="Full location directory" /><div className="location-grid">{locations.slice(0, 9).map((area) => <Link className="location-card" href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} key={area.slug}>{area.name}<span>↗</span></Link>)}</div><details className="directory-expander"><summary>Explore the full directory of all 33 authorities</summary><div className="location-grid">{locations.slice(9).map((area) => <Link className="location-card" href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} key={area.slug}>{area.name}<span>↗</span></Link>)}</div></details></div>
    </section>

    <section className="section section-tight"><div className="container"><SectionHead kicker="Moving guides" title="Helpful advice for your next move" copy="Practical reading to help you prepare addresses, access, belongings and moving-day plans." href="/guides" link="All moving guides" /><div className="guide-grid">{articles.slice(0, 4).map((article, i) => <article className="guide-card" key={article.slug}><div className="guide-num">0{i + 1}</div><h3>{article.title}</h3><p>{article.summary}</p><Link href={`/guides/${article.slug}`}>Read the guide ↗</Link></article>)}</div></div></section>

    <section className="section section-dark section-tight"><div className="container feature-row"><div><div className="kicker">Moving vehicles and equipment</div><h2>Equipment choices depend on your move</h2><p className="section-intro" style={{ color: "#cfddd2" }}>The right arrangements depend on your inventory, route and access at each address. Share those details so requirements can be reviewed; vehicle sizes and load capacities are confirmed rather than assumed.</p><Link className="button" href="/quote">Describe your move <span>↗</span></Link></div><div className="photo-panel" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80)" }} role="img" aria-label="Moving truck on a city street"><span className="photo-panel-label">Arrangements assessed for each request</span></div></div></section>

    <section className="section">
      <div className="container">
        <SectionHead kicker="Moving day options" title="Tell us when you need to move" copy="Include your ideal date and timing when you enquire. If your schedule is flexible, sharing alternatives can help the team discuss possible arrangements." />
        <div className="service-grid">
          {[["Weekday moves", "Share your preferred weekday and any building access hours to consider."], ["Weekend requests", "Let us know if a weekend date would suit your move; availability must be confirmed."], ["Flexible dates", "Provide a date range if you have flexibility around your preferred day."], ["Urgent enquiries", "Submit urgent requests for review, understanding that short-notice availability is not guaranteed."], ["Evening access", "Mention any evening access requirements and confirm building permissions."], ["Moving date changes", "Check written booking terms and contact the business to discuss a change."]].map(([title, copy]) => <article className="service-card" key={title}><div className="service-icon">◷</div><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </div>
    </section>

    <section className="section section-white section-tight"><div className="container"><SectionHead kicker="A closer look at the process" title="What happens from your enquiry to delivery" copy="Clear details help the team understand the move and explain the next steps." /><div className="steps">{[["Initial enquiry", "Share your route, date and main moving requirements."], ["Inventory review", "List belongings, fragile items and anything unusual."], ["Access assessment", "Describe parking, loading distance, floors, stairs and lifts."], ["Quotation", "Review the proposed arrangements and individual quotation."], ["Booking confirmation", "Confirm the written details before the move is scheduled."], ["Collection", "Prepare access and belongings for the agreed collection."], ["Transportation", "Follow the route and timing agreed for the move."], ["Delivery", "Confirm destination access and delivery instructions."]].map(([title, copy]) => <article className="step" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

    <section className="section"><div className="container"><SectionHead kicker="Customer feedback" title="Reviews from our customers" copy="4.9/5 customer satisfaction on Google. Individual reviews are shared only with permission." /><div className="status-message">Individual customer reviews are not displayed here.</div></div></section>

    <section className="section section-white"><div className="container"><SectionHead kicker="Frequently asked questions" title="Questions about planning a move" copy="Find quick answers about quotations, access, services and moving arrangements." href="/faqs" link="All FAQs" /><div className="faq-list">{faqs.slice(0, 6).map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

    <section className="section section-tight"><div className="container"><SectionHead kicker="Moving cost guide" title="What can affect the cost of a move?" copy="A useful quotation depends on the work involved. These details help build a clearer picture; prices are not published until confirmed by the business." /><div className="cost-grid">{[["Property size", "Rooms and the amount to move"], ["Inventory", "Number, size and type of items"], ["Distance", "Route and travel between addresses"], ["Floors and lifts", "Stairs, lift access and loading distance"], ["Parking", "Restrictions, permits and access"], ["Packing", "Full, partial or fragile-item packing"], ["Specialist items", "Assessment and handling requirements"], ["Moving date", "Preferred day, time and flexibility"], ["Storage", "Whether storage is needed and for how long"]].map(([title, copy]) => <div className="cost-item" key={title}><b>{title}</b><span>{copy}</span></div>)}</div><p className="disclaimer" style={{ marginTop: 16 }}>No fixed prices or cost guarantees are shown. Request an individual quotation based on your requirements.</p></div></section>

    <section className="section section-white section-tight"><div className="container"><QuoteBanner /></div></section>
  </>;
}
