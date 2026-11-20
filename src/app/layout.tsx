import type { Metadata } from "next";
import { Footer, Header } from "@/components/Site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "London Movers | Moving and Removals Enquiries",
    template: "%s | London Movers",
  },
  description:
    "Explore moving services and London area information, then tell us about your move to request an individual quotation.",
  openGraph: {
    title: "London Movers",
    description: "Moving and removals enquiries across London.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "London Movers",
    description: "Moving and removals enquiries across London.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
