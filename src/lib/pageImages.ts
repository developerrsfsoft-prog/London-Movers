import pageImageMappings from "@/data/pageImages.json";

export type PageImage = {
  src: string;
  alt: string;
  credit?: {
    label: string;
    href: string;
  };
  source?: {
    title: string;
    author: string;
    license: string;
    licenseUrl: string;
  };
};

type LocationImageKey = `region:${string}` | `borough:${string}:${string}` | `neighbourhood:${string}:${string}`;

const servicePageImages: Record<string, PageImage> = pageImageMappings.services;

const serviceCategoryImages: Record<string, PageImage> = {
  Residential: servicePageImages["house-removals"],
  Commercial: servicePageImages["office-removals"],
  Transport: servicePageImages["long-distance-removals"],
  Packing: servicePageImages["packing-services"],
  Furniture: servicePageImages["furniture-removals"],
  Storage: servicePageImages["storage-solutions"],
  Specialist: servicePageImages["furniture-removals"],
  Additional: servicePageImages["long-distance-removals"],
};

const locationPageImages: Partial<Record<LocationImageKey, PageImage>> = pageImageMappings.locations;

export const londonAreaImage: PageImage = {
  src: "/images/london-aerial.jpg",
  alt: "Aerial photograph of London and the River Thames",
};

export function getServicePageImage(slug: string, category?: string): PageImage | undefined {
  return servicePageImages[slug] || (category ? serviceCategoryImages[category] : undefined);
}

export function getLocationPageImage(
  location: { kind: "region"; slug: string } |
    { kind: "borough" | "neighbourhood"; slug: string; regionSlug: string },
): PageImage | undefined {
  const key: LocationImageKey = location.kind === "region"
    ? `region:${location.slug}`
    : `${location.kind}:${location.regionSlug}:${location.slug}`;
  return locationPageImages[key];
}
