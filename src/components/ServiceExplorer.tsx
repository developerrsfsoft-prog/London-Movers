"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { services } from "../../data";

const categories = ["Residential", "Commercial", "Transport", "Packing", "Furniture", "Storage", "Specialist", "Additional"];
const icons: Record<string, string> = {
  Residential: "⌂",
  Commercial: "▦",
  Transport: "⇄",
  Packing: "▧",
  Furniture: "▰",
  Storage: "▤",
  Specialist: "◇",
  Additional: "◷",
};

export default function ServiceExplorer() {
  const [serviceList, setServiceList] = useState(services);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All services");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [directoryError, setDirectoryError] = useState("");
  useEffect(() => {
    fetch("/api/content/services").then(async (response) => {
      if (!response.ok) throw new Error("Unable to load the service directory.");
      const result = await response.json() as { records?: typeof services };
      if (result.records) setServiceList(result.records);
    }).catch((error: unknown) => setDirectoryError(error instanceof Error ? error.message : "Unable to refresh the service directory."));
  }, []);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return serviceList.filter((service) => {
      const matchesCategory = activeCategory === "All services" || service.category === activeCategory;
      const matchesQuery = !term || `${service.name} ${service.summary} ${service.category}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, serviceList]);
  const toggle = (category: string) => {
    setExpanded((current) => current.includes(category) ? current.filter((value) => value !== category) : [...current, category]);
  };

  return <div className="service-explorer">
    <div className="service-explorer-toolbar">
      <label className="field service-search"><span>Search services</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try house, packing or piano" /></label>
      <Link className="text-link" href="/services">View all services <span>↗</span></Link>
    </div>
    <div className="service-filters" aria-label="Filter services by category">
      {["All services", ...categories].map((category) => <button className={activeCategory === category ? "service-filter active" : "service-filter"} key={category} onClick={() => { setActiveCategory(category); setExpanded(category === "All services" ? [] : [category]); }} aria-pressed={activeCategory === category}>{category}<span>{category === "All services" ? serviceList.length : serviceList.filter((service) => service.category === category).length}</span></button>)}
    </div>
    {directoryError && <p className="error-message" role="status">{directoryError} Showing the saved directory snapshot instead.</p>}
    <div className="service-category-list">
      {categories.map((category) => {
        const categoryServices = filtered.filter((service) => service.category === category);
        if (!categoryServices.length) return null;
        const isOpen = expanded.includes(category) || Boolean(query);
        return <section className="service-category" key={category}>
          <button className="service-category-heading" aria-expanded={isOpen} onClick={() => toggle(category)}>
            <span className="service-category-icon">{icons[category]}</span>
            <span><b>{category}</b><small>{categoryServices.length} moving options to enquire about</small></span>
            <span className="service-category-toggle">{isOpen ? "−" : "+"}</span>
          </button>
          {isOpen && <div className="service-option-grid">{categoryServices.map((service) => <Link className="service-option" href={`/services/${service.slug}`} key={service.slug}>
            <span className="service-option-mark" aria-hidden="true">↗</span>
            <span><b>{service.name}</b><small>{service.summary}</small></span>
          </Link>)}</div>}
        </section>;
      })}
      {!filtered.length && <div className="empty-search"><b>No matching services</b><span>Try a different search, or view the full directory.</span><Link href="/services">Browse services ↗</Link></div>}
    </div>
    <p className="service-availability-note">These are service enquiry categories, not a confirmation of current availability. Ask the business to confirm capability and arrangements before booking.</p>
  </div>;
}
