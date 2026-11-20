import type { Metadata } from "next";
import QuoteWizard from "@/components/QuoteWizard";

export const metadata: Metadata = { title: "Request a moving quotation", description: "Share your move details to request an individual moving quotation from London Movers." };

export default async function QuotePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initial = {
    from: typeof params.from === "string" ? params.from : "",
    to: typeof params.to === "string" ? params.to : "",
    size: typeof params.size === "string" ? params.size : "",
  };
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><a href="/">Home</a> / Request a quote</div><div className="eyebrow">A few details to get started</div><h1>Tell us about your move.</h1><p>Share your addresses, property details and preferred date. The more we know, the better we can review your requirements.</p></div></section><div className="container"><QuoteWizard initial={initial} /></div></>;
}
