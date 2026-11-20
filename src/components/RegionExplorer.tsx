import Link from "next/link";
import { regions } from "../../data";

const descriptions: Record<string, string> = {
  "central-london": "Browse central London borough and neighbourhood directory pages.",
  "north-london": "Explore northern London area groupings and local directory entries.",
  "north-west-london": "Find North West London borough and neighbourhood listings.",
  "west-london": "Browse West London area information and directory pages.",
  "south-west-london": "Explore South West London locations and related move information.",
  "south-london": "Find South London borough and neighbourhood listings.",
  "south-east-london": "Browse South East London authorities and neighbourhood examples.",
  "east-london": "Explore East London area groupings in the directory.",
  "north-east-london": "Find North East London directory entries and nearby areas.",
};

export default function RegionExplorer() {
  return <div className="region-explorer">{regions.map((region, index) => <Link className="region-card" href={`/areas-we-cover/${region.slug}`} key={region.slug}>
    <span className="region-card-number">0{index + 1}</span>
    <div><h3>{region.name}</h3><p>{descriptions[region.slug]}</p></div>
    <small>{region.boroughs.length} authority listings</small>
    <span className="region-card-arrow" aria-hidden="true">↗</span>
  </Link>)}</div>;
}
