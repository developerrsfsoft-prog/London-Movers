"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allNeighbourhoods, locations, neighbourhoodUrl, regions } from "../../data";

const initialEntries = [
  ...regions.map((region) => ({ name: region.name, type: "Website region", href: `/areas-we-cover/${region.slug}`, keywords: region.name, regionSlug: region.slug })),
  ...locations.map((area) => ({ name: area.name, type: area.type === "city" ? "City" : "Borough", href: `/areas-we-cover/${area.regionSlug}/${area.slug}`, keywords: `${area.name} ${area.regionName}`, regionSlug: area.regionSlug })),
  ...allNeighbourhoods.map((area) => ({ name: area.name, type: "Neighbourhood", href: neighbourhoodUrl(area), keywords: `${area.name} ${area.regionName}`, regionSlug: area.regionSlug })),
];

export default function LocationSearch({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [directoryEntries, setDirectoryEntries] = useState(initialEntries);
  const [directoryError, setDirectoryError] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [letterFilter, setLetterFilter] = useState("");
  useEffect(() => {
    Promise.all(["locations", "neighbourhoods"].map(async (collection) => {
      const response = await fetch(`/api/content/${collection}`);
      if (!response.ok) throw new Error("The location directory could not be refreshed.");
      return response.json() as Promise<{ records?: Array<{ name: string; slug: string; regionSlug: string; regionName: string; type?: string }> }>;
    })).then(([boroughs, neighbourhoods]) => {
      const regionEntries = regions.map((region) => ({ name: region.name, type: "Website region", href: `/areas-we-cover/${region.slug}`, keywords: region.name, regionSlug: region.slug }));
      const boroughEntries = (boroughs.records || []).map((area) => ({ name: area.name, type: area.type === "city" ? "City" : "Borough", href: `/areas-we-cover/${area.regionSlug}/${area.slug}`, keywords: `${area.name} ${area.regionName}`, regionSlug: area.regionSlug }));
      const neighbourhoodEntries = (neighbourhoods.records || []).map((area) => ({ name: area.name, type: "Neighbourhood", href: neighbourhoodUrl(area), keywords: `${area.name} ${area.regionName}`, regionSlug: area.regionSlug }));
      setDirectoryEntries([...regionEntries, ...boroughEntries, ...neighbourhoodEntries]);
      setDirectoryError("");
    }).catch((error: unknown) => setDirectoryError(error instanceof Error ? error.message : "The location directory could not be refreshed."));
  }, []);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return directoryEntries.filter((entry) => {
      const matchesTerm = !term || entry.keywords.toLowerCase().includes(term);
      const matchesRegion = regionFilter === "All regions" || entry.regionSlug === regionFilter;
      const matchesLetter = !letterFilter || entry.name.toLowerCase().startsWith(letterFilter.toLowerCase());
      return matchesTerm && matchesRegion && matchesLetter;
    }).slice(0, 12);
  }, [directoryEntries, query, regionFilter, letterFilter]);

  return <section className={compact ? "location-search is-compact" : "location-search"} aria-labelledby={compact ? "location-search-compact-title" : "location-search-title"}>
    {!compact && <div><div className="kicker">Area directory search</div><h2 id="location-search-title">Find a London area</h2><p>Search region, borough or neighbourhood names.</p></div>}
    {compact && <div className="kicker">Search the London directory</div>}
    <div className="location-search-controls">
      <label className="field"><span>Region</span><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option>All regions</option>{regions.map((region) => <option value={region.slug} key={region.slug}>{region.name}</option>)}</select></label>
      <label className="field"><span>{compact ? "Area, borough or neighbourhood" : "Area name"}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Westminster or Ealing" autoComplete="off" /></label>
    </div>
    {directoryError && <p className="error-message" role="status">{directoryError} Showing the saved directory snapshot instead.</p>}
    <div className="location-alphabet" aria-label="Filter areas alphabetically">{["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((letter) => <button className={(letter === "All" ? !letterFilter : letterFilter === letter) ? "active" : ""} key={letter} onClick={() => setLetterFilter(letter === "All" ? "" : letter)}>{letter}</button>)}</div>
    {(query.trim().length >= 2 || regionFilter !== "All regions" || letterFilter) && <div className="location-search-results" aria-live="polite">
      {results.length ? results.map((entry) => <Link href={entry.href} key={`${entry.href}-${entry.name}`}><span>{entry.name}<small>{entry.type}</small></span><b>↗</b></Link>) : <p>No matching area names found. Try a region, borough or neighbourhood name.</p>}
    </div>}
    {!compact && <div className="address-data-note"><span>Street lookup</span><b>Not available</b><span>Postcode lookup</span><b>Not available</b><p>Verified street and postcode data has not been supplied. We do not invent address coverage.</p></div>}
    <p className="disclaimer">Area-name search covers directory entries only and does not confirm service coverage at an address.</p>
  </section>;
}
