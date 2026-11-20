import { allNeighbourhoods, locations, neighbourhoodUrl, popularAreas, services } from "../../data";

export type KeywordRecord = {
  id: string;
  keyword: string;
  role: "Primary" | "Secondary";
  cluster: string;
  intent: "Commercial" | "Transactional" | "Informational" | "Local";
  targetUrl: string;
  pageType: string;
  service: string;
  location: string;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
  priority: "High" | "Medium" | "Low";
  researchSource: string;
  researchDate: string;
  rankingPosition: number | null;
  indexStatus: "Noindex until verified" | "Index";
  contentStatus: "Draft" | "Needs review" | "Ready";
  seoTitle: string;
  metaDescription: string;
};

const row = (entry: Omit<KeywordRecord, "searchVolume" | "difficulty" | "cpc" | "researchSource" | "researchDate" | "rankingPosition" | "contentStatus" | "seoTitle" | "metaDescription">): KeywordRecord => ({
  ...entry,
  searchVolume: null,
  difficulty: null,
  cpc: null,
  researchSource: "Not researched",
  researchDate: "Not researched",
  rankingPosition: null,
  contentStatus: "Needs review",
  seoTitle: "",
  metaDescription: "",
});

const core = [
  row({ id: "kw-home-removals-london", keyword: "removals London", role: "Primary", cluster: "London removals", intent: "Commercial", targetUrl: "/", pageType: "Homepage", service: "All services", location: "London", priority: "High", indexStatus: "Index" }),
  row({ id: "kw-london-movers", keyword: "London movers", role: "Secondary", cluster: "London removals", intent: "Commercial", targetUrl: "/", pageType: "Homepage", service: "All services", location: "London", priority: "High", indexStatus: "Index" }),
  row({ id: "kw-moving-company-london", keyword: "moving company London", role: "Secondary", cluster: "London removals", intent: "Commercial", targetUrl: "/", pageType: "Homepage", service: "All services", location: "London", priority: "High", indexStatus: "Index" }),
  row({ id: "kw-house-removals-london", keyword: "house removals London", role: "Primary", cluster: "Residential removals", intent: "Transactional", targetUrl: "/services/house-removals", pageType: "Service", service: "House removals", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-home-removals-secondary", keyword: "home removals London", role: "Secondary", cluster: "Residential removals", intent: "Transactional", targetUrl: "/services/house-removals", pageType: "Service", service: "House removals", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-flat-removals-london", keyword: "flat removals London", role: "Primary", cluster: "Residential removals", intent: "Transactional", targetUrl: "/services/flat-removals", pageType: "Service", service: "Flat removals", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-apartment-removals-london", keyword: "apartment removals London", role: "Primary", cluster: "Residential removals", intent: "Transactional", targetUrl: "/services/apartment-moving", pageType: "Service", service: "Apartment removals", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-office-removals-london", keyword: "office removals London", role: "Primary", cluster: "Commercial removals", intent: "Transactional", targetUrl: "/services/office-removals", pageType: "Service", service: "Office removals", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-office-relocation-london", keyword: "office relocation London", role: "Primary", cluster: "Commercial removals", intent: "Transactional", targetUrl: "/services/office-relocation", pageType: "Service", service: "Office relocation", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-commercial-removals-london", keyword: "commercial removals London", role: "Primary", cluster: "Commercial removals", intent: "Transactional", targetUrl: "/services/commercial-removals", pageType: "Service", service: "Commercial removals", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-man-and-van-london", keyword: "man and van London", role: "Primary", cluster: "Man and van", intent: "Transactional", targetUrl: "/services/man-and-van", pageType: "Service", service: "Man and van", location: "London", priority: "High", indexStatus: "Noindex until verified" }),
  row({ id: "kw-man-with-van-london", keyword: "man with a van London", role: "Secondary", cluster: "Man and van", intent: "Transactional", targetUrl: "/services/man-and-van", pageType: "Service", service: "Man and van", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-packing-london", keyword: "packing services London", role: "Primary", cluster: "Packing services", intent: "Transactional", targetUrl: "/services/packing-services", pageType: "Service", service: "Packing services", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-unpacking-london", keyword: "unpacking services London", role: "Primary", cluster: "Packing services", intent: "Transactional", targetUrl: "/services/unpacking-services", pageType: "Service", service: "Unpacking services", location: "London", priority: "Low", indexStatus: "Noindex until verified" }),
  row({ id: "kw-furniture-removals-london", keyword: "furniture removals London", role: "Primary", cluster: "Furniture transport", intent: "Transactional", targetUrl: "/services/furniture-removals", pageType: "Service", service: "Furniture removals", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-storage-london", keyword: "storage London", role: "Primary", cluster: "Storage", intent: "Commercial", targetUrl: "/services/storage-solutions", pageType: "Service", service: "Storage solutions", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-piano-removals-london", keyword: "piano removals London", role: "Primary", cluster: "Specialist removals", intent: "Transactional", targetUrl: "/services/piano-removals", pageType: "Service", service: "Piano removals", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-heavy-item-removals-london", keyword: "heavy item removals London", role: "Primary", cluster: "Specialist removals", intent: "Transactional", targetUrl: "/services/heavy-item-moving", pageType: "Service", service: "Heavy item removals", location: "London", priority: "Low", indexStatus: "Noindex until verified" }),
  row({ id: "kw-long-distance-london", keyword: "long distance removals London", role: "Primary", cluster: "Long-distance removals", intent: "Transactional", targetUrl: "/services/long-distance-removals", pageType: "Service", service: "Long-distance removals", location: "London", priority: "Medium", indexStatus: "Noindex until verified" }),
  row({ id: "kw-same-day-london", keyword: "same-day removals London", role: "Primary", cluster: "Urgent removals", intent: "Transactional", targetUrl: "/services/same-day-moving", pageType: "Service", service: "Same-day moving", location: "London", priority: "Low", indexStatus: "Noindex until verified" }),
  row({ id: "kw-removals-cost-london", keyword: "removals London prices", role: "Primary", cluster: "Moving costs", intent: "Commercial", targetUrl: "/moving-cost-guide", pageType: "Guide", service: "All services", location: "London", priority: "High", indexStatus: "Index" }),
  row({ id: "kw-house-removal-cost-london", keyword: "how much do removals cost in London", role: "Secondary", cluster: "Moving costs", intent: "Informational", targetUrl: "/moving-cost-guide", pageType: "Guide", service: "All services", location: "London", priority: "Medium", indexStatus: "Index" }),
  row({ id: "kw-moving-checklist-london", keyword: "London moving checklist", role: "Primary", cluster: "Moving advice", intent: "Informational", targetUrl: "/moving-checklist", pageType: "Guide", service: "All services", location: "London", priority: "Medium", indexStatus: "Index" }),
];

const boroughKeywords = locations.flatMap((location) => {
  const targetUrl = `/areas-we-cover/${location.regionSlug}/${location.slug}`;
  const id = location.slug.replace(/-/g, "");
  return [
    row({ id: `kw-local-${id}-removals`, keyword: `removals ${location.name}`, role: "Primary", cluster: "Local removals", intent: "Local", targetUrl, pageType: "Borough", service: "All services", location: location.name, priority: "Medium", indexStatus: "Noindex until verified" }),
    row({ id: `kw-local-${id}-company`, keyword: `removal company ${location.name}`, role: "Secondary", cluster: "Local removals", intent: "Local", targetUrl, pageType: "Borough", service: "All services", location: location.name, priority: "Low", indexStatus: "Noindex until verified" }),
  ];
});

const boroughNames = new Set(locations.map((location) => location.name.toLowerCase()));
const neighbourhoodKeywords = [...new Set(popularAreas.filter((name) => !boroughNames.has(name.toLowerCase())))].flatMap((name) => {
  const area = allNeighbourhoods.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  if (!area) return [];
  const targetUrl = neighbourhoodUrl(area);
  const id = area.slug.replace(/-/g, "");
  return [row({ id: `kw-neighbourhood-${id}`, keyword: `removals ${area.name}`, role: "Primary", cluster: "Local removals", intent: "Local", targetUrl, pageType: "Neighbourhood", service: "All services", location: area.name, priority: "Low", indexStatus: "Noindex until verified" })];
});

export const initialKeywords: KeywordRecord[] = [...core, ...boroughKeywords, ...neighbourhoodKeywords];

export const keywordClusters = [...new Set(initialKeywords.map((item) => item.cluster))];
export const keywordTargetPages = [
  { url: "/", title: "London Movers homepage", description: "Explore London moving services and area information." },
  ...services.map((service) => ({ url: `/services/${service.slug}`, title: "", description: "" })),
  ...locations.map((location) => ({ url: `/areas-we-cover/${location.regionSlug}/${location.slug}`, title: "", description: "" })),
  ...allNeighbourhoods.map((area) => ({ url: neighbourhoodUrl(area), title: "", description: "" })),
  { url: "/moving-cost-guide", title: "London removals cost guide", description: "Factors that can affect a moving quotation." },
  { url: "/moving-checklist", title: "London moving checklist", description: "A practical checklist for organising a move." },
];
