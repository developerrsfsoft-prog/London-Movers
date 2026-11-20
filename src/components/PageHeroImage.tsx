import Image from "next/image";
import type { PageImage } from "@/lib/pageImages";

export default function PageHeroImage({ image, missingLabel }: { image?: PageImage; missingLabel: string }) {
  if (!image) {
    return <div className="page-hero-photo-missing" role="status">{missingLabel}</div>;
  }

  return <div className="page-hero-media">
    <Image
      src={image.src}
      alt={image.alt}
      fill
      priority
      sizes="(max-width: 780px) 100vw, 55vw"
    />
    {image.credit && <a className="page-hero-photo-credit" href={image.credit.href} target="_blank" rel="noreferrer">
      {image.credit.label}
    </a>}
  </div>;
}
