import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allNeighbourhoods, locations, neighbourhoodRouteSegments, neighbourhoodUrl, regions } from "../../../../data";
import { findRecordBySlug, getKeywordMetadata, listRecords } from "@/lib/database";
import ConversionPanel from "@/components/ConversionPanel";
import PageHeroImage from "@/components/PageHeroImage";
import { getLocationPageImage } from "@/lib/pageImages";

type Props = { params: Promise<{ slug: string[] }> };
type DirectoryArea = { name: string; slug: string; regionSlug: string; regionName: string; type?: string };
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const paths = [
    ...regions.map((region) => ({ slug: [region.slug] })),
    ...locations.map((area) => ({ slug: [area.regionSlug, area.slug] })),
    ...allNeighbourhoods.map((area) => ({ slug: neighbourhoodRouteSegments(area) })),
  ];
  return paths.filter((path, index) => paths.findIndex((candidate) => candidate.slug.join("/") === path.slug.join("/")) === index);
}

function toDirectoryArea(value: Record<string, unknown> | null): DirectoryArea | null {
  if (!value || typeof value.name !== "string" || typeof value.slug !== "string" ||
      typeof value.regionSlug !== "string" || typeof value.regionName !== "string") return null;
  return value as DirectoryArea;
}

async function resolve(slug: string[]) {
  if (slug.length === 1) {
    const region = regions.find((entry) => entry.slug === slug[0]);
    return region ? { kind: "region" as const, item: region } : null;
  }
  if (slug.length === 3 && slug[1] === "neighbourhoods") {
    const neighbourhood = toDirectoryArea(findRecordBySlug("neighbourhoods", slug[2], slug[0]));
    if (neighbourhood) return { kind: "neighbourhood" as const, item: neighbourhood };
  }
  if (slug.length === 2) {
    const borough = toDirectoryArea(findRecordBySlug("locations", slug[1], slug[0]));
    if (borough) return { kind: "borough" as const, item: borough };
    const neighbourhood = toDirectoryArea(findRecordBySlug("neighbourhoods", slug[1], slug[0]));
    if (neighbourhood) return { kind: "neighbourhood" as const, item: neighbourhood };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolve(slug);
  if (!result?.item) return {};
  const title = result.kind === "region" ? `Moving services in ${result.item.name}` : `Moving information for ${result.item.name}, London`;
  const path = `/areas-we-cover/${slug.join("/")}`;
  const keyword = getKeywordMetadata(path);
  return {
    title: keyword?.seoTitle || title,
    description: keyword?.metaDescription || `Explore moving information for ${result.item.name}, London. Check availability for your address before booking.`,
    alternates: { canonical: path },
    ...(result.kind !== "region" || keyword ? { robots: { index: keyword ? keyword.indexStatus === "Index" : false, follow: true } } : {}),
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const result = await resolve(slug);
  if (!result?.item) notFound();

  if (result.kind === "region") {
    const heroImage = getLocationPageImage({ kind: "region", slug: result.item.slug });
    const boroughs = listRecords("locations", "", 1, 500).records
      .filter((area): area is typeof area & { name: string; slug: string; regionSlug: string } =>
        area.regionSlug === result.item.slug && typeof area.name === "string" && typeof area.slug === "string");
    const neighbourhoods = listRecords("neighbourhoods", "", 1, 500).records
      .filter((area): area is typeof area & { name: string; slug: string; regionSlug: string } =>
        area.regionSlug === result.item.slug && typeof area.name === "string" && typeof area.slug === "string");
    return <>
      <section className="page-hero page-hero-with-image"><PageHeroImage image={heroImage} missingLabel={`No verified local photograph is available for ${result.item.name} yet.`} /><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/areas-we-cover">London areas</Link> / {result.item.name}</div><div className="eyebrow">London moving area directory</div><h1>Moving information for {result.item.name}</h1><p>Browse the boroughs and neighbourhood names grouped under {result.item.name}. Share both postcodes to check availability for your move.</p><div className="hero-actions page-hero-actions"><Link className="button" href="/quote">Check availability <span>↗</span></Link><Link className="button button-outline" href="/areas-we-cover">All London areas</Link></div></div></section>
      <section className="section"><div className="container"><div className="section-head"><div><div className="kicker">Boroughs in this website region</div><h2>Explore local authority pages</h2><p>Regional groupings are used for website navigation and do not represent official boundaries.</p></div></div><div className="location-grid">{boroughs.map((area) => <Link className="location-card" href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} key={area.slug}>{area.name}<span>↗</span></Link>)}</div></div></section>
      <section className="section section-white"><div className="container"><div className="section-head"><div><div className="kicker">Neighbourhood directory</div><h2>Browse neighbourhood names</h2><p>These examples help you navigate the directory. Address-level coverage must be checked separately.</p></div></div><div className="area-cloud">{neighbourhoods.map((area) => <Link href={neighbourhoodUrl(area)} key={area.slug}>{area.name}</Link>)}</div></div></section>
      <section className="section section-tight"><div className="container"><div className="status-message">Location information is a directory, not confirmation of service availability. Share your postcode in a quote request so the business can verify your address.</div></div></section>
    </>;
  }

  const item = result.item;
  const region = regions.find((entry) => entry.slug === item.regionSlug);
  if (!region) notFound();
  const isBorough = result.kind === "borough";
  const heroImage = getLocationPageImage({
    kind: result.kind,
    slug: item.slug,
    regionSlug: item.regionSlug,
  });
  const neighbourhoods = region.neighbourhoods.filter((name) => {
    if (!isBorough) return name.toLowerCase() === item.name.toLowerCase();
    return name.toLowerCase().includes(item.name.toLowerCase()) ||
      (item.name === "Westminster" && ["Mayfair", "Soho", "Covent Garden", "Marylebone", "Pimlico", "Victoria", "Belgravia", "Paddington"].includes(name)) ||
      (item.name === "Camden" && ["Camden Town", "Hampstead", "Fitzrovia", "Holborn", "Bloomsbury"].includes(name)) ||
      (item.name === "Islington" && ["Angel", "Clerkenwell"].includes(name)) ||
      (item.name === "Kensington and Chelsea" && ["Chelsea", "South Kensington", "Notting Hill", "Knightsbridge"].includes(name)) ||
      (item.name === "Barnet" && ["Finchley", "Hendon", "Golders Green", "Edgware", "Mill Hill"].includes(name)) ||
      (item.name === "Enfield" && ["Enfield Town", "Edmonton", "Palmers Green", "Southgate"].includes(name)) ||
      (item.name === "Haringey" && ["Muswell Hill", "Crouch End", "Wood Green", "Tottenham"].includes(name)) ||
      (item.name === "Brent" && ["Wembley", "Kilburn", "Willesden", "Neasden", "Harlesden", "Kingsbury"].includes(name)) ||
      (item.name === "Harrow" && ["Harrow", "Pinner", "Kenton", "Stanmore", "Queensbury"].includes(name)) ||
      (item.name === "Ealing" && ["Southall", "Acton", "Ealing Broadway", "Hanwell", "Greenford"].includes(name)) ||
      (item.name === "Hillingdon" && ["Uxbridge", "Hayes", "West Drayton", "Ruislip", "Northwood"].includes(name)) ||
      (item.name === "Hammersmith and Fulham" && ["Hammersmith", "Fulham", "Shepherd's Bush"].includes(name)) ||
      (item.name === "Hounslow" && ["Chiswick", "Brentford", "Hounslow", "Isleworth", "Feltham"].includes(name)) ||
      (item.name === "Richmond upon Thames" && ["Richmond", "Twickenham", "Teddington", "Hampton"].includes(name)) ||
      (item.name === "Kingston upon Thames" && ["Kingston", "Surbiton", "New Malden"].includes(name)) ||
      (item.name === "Merton" && ["Wimbledon", "Morden", "Mitcham"].includes(name)) ||
      (item.name === "Wandsworth" && ["Putney", "Battersea", "Balham", "Tooting", "Earlsfield", "Wandsworth"].includes(name)) ||
      (item.name === "Croydon" && ["Croydon", "Purley", "Thornton Heath", "South Norwood"].includes(name)) ||
      (item.name === "Lambeth" && ["Brixton", "Clapham", "Streatham", "Vauxhall", "Kennington", "Stockwell"].includes(name)) ||
      (item.name === "Sutton" && ["Sutton", "Carshalton", "Wallington", "Cheam"].includes(name)) ||
      (item.name === "Southwark" && ["London Bridge", "Bermondsey", "Rotherhithe", "Peckham", "Dulwich", "Camberwell"].includes(name)) ||
      (item.name === "Lewisham" && ["Deptford", "Lewisham", "Catford", "Blackheath"].includes(name)) ||
      (item.name === "Greenwich" && ["Greenwich", "Woolwich", "Eltham", "Thamesmead"].includes(name)) ||
      (item.name === "Bexley" && ["Bexleyheath", "Sidcup"].includes(name)) ||
      (item.name === "Bromley" && ["Bromley", "Orpington", "Beckenham"].includes(name)) ||
      (item.name === "Tower Hamlets" && ["Canary Wharf", "Poplar", "Limehouse", "Whitechapel", "Bethnal Green", "Bow", "Mile End"].includes(name)) ||
      (item.name === "Newham" && ["Stratford", "West Ham", "East Ham", "Canning Town", "Plaistow"].includes(name)) ||
      (item.name === "Barking and Dagenham" && ["Barking", "Dagenham"].includes(name)) ||
      (item.name === "Havering" && ["Romford", "Hornchurch", "Upminster"].includes(name)) ||
      (item.name === "Hackney" && ["Hackney Central", "Dalston", "Shoreditch", "Stoke Newington", "Clapton", "Homerton"].includes(name)) ||
      (item.name === "Waltham Forest" && ["Walthamstow", "Leyton", "Leytonstone", "Chingford"].includes(name)) ||
      (item.name === "Redbridge" && ["Woodford", "Wanstead", "Ilford", "Seven Kings", "Gants Hill", "South Woodford"].includes(name));
  });
  const title = isBorough ? `Professional removals in ${item.name}, London` : `Moving information for ${item.name}, London`;
  return <>
    <section className="page-hero page-hero-with-image"><PageHeroImage image={heroImage} missingLabel={`No verified local photograph is available for ${item.name} yet.`} /><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/areas-we-cover">London areas</Link> / <Link href={`/areas-we-cover/${region.slug}`}>{region.name}</Link> / {item.name}</div><div className="eyebrow">{region.name} area directory</div><h1>{title}</h1><p>Planning a move in {item.name}? Whether you are relocating from a home, flat, office or commercial premises, share your postcodes and requirements to ask about available arrangements.</p><div className="hero-actions page-hero-actions"><Link className="button" href="/quote">Check availability <span>↗</span></Link><Link className="button button-outline" href={`/areas-we-cover/${region.slug}`}>Explore {region.name}</Link></div></div></section>
    <section className="section"><div className="container detail-layout"><article className="content-wrap detail-content"><h2>Plan a move in {item.name}</h2><p>Start with your pickup and destination postcodes, property details, inventory and preferred moving date. Access, parking, stairs, lifts and building arrangements can all affect how a move is planned.</p><p>This page provides directory information only. We do not assume address-level coverage, local restrictions or specific service availability. Please check the details that apply to your addresses.</p>
      {neighbourhoods.length > 0 && <><h2>Neighbourhood directory</h2><p>Example neighbourhood names associated with the {item.name} directory grouping:</p><div className="area-cloud">{neighbourhoods.map((name) => { const match = allNeighbourhoods.find((area) => area.name === name); return match ? <Link href={neighbourhoodUrl(match)} key={name}>{name}</Link> : <span key={name}>{name}</span>; })}</div></>}
      <h2>Moving considerations</h2><ul><li>Confirm loading and parking arrangements before moving day.</li><li>Check building access, lift bookings and any management requirements.</li><li>Describe floors, stairs and the distance from the entrance to the vehicle.</li><li>Arrange the appropriate permissions for restricted premises.</li><li>Include fragile, bulky or specialist belongings in your request.</li></ul>
      <h2>Services to ask about</h2><p>Household moves, flat moves, office relocations, packing, furniture transport and other requests can be discussed. Availability and capability are confirmed individually.</p>
    </article><ConversionPanel title={`Moving in ${item.name}?`} description="Share your postcodes and move details to ask about availability." label="Check availability" /></div></section>
    <section className="section section-white section-tight"><div className="container"><div className="section-head"><div><div className="kicker">Nearby directory links</div><h2>Explore more of {region.name}</h2></div><Link className="text-link" href={`/areas-we-cover/${region.slug}`}>View region ↗</Link></div><div className="location-grid">{listRecords("locations", "", 1, 500).records.filter((area): area is typeof area & { name: string; slug: string; regionSlug: string } => area.regionSlug === region.slug && typeof area.name === "string" && typeof area.slug === "string").map((area) => <Link className="location-card" href={`/areas-we-cover/${area.regionSlug}/${area.slug}`} key={area.slug}>{area.name}<span>↗</span></Link>)}</div></div></section>
  </>;
}
