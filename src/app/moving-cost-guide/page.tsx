import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "London removals cost guide", description: "Understand the factors that can affect a London removals quotation, from inventory and access to packing and timing." };
const factors = [
  ["Property size and inventory", "The number and size of belongings affect the planning and work involved. Share an inventory, including large and fragile items."],
  ["Route and distance", "Provide pickup and destination postcodes so the route and travel between addresses can be assessed."],
  ["Floors, stairs and lifts", "Floor level, lift availability, stairs and the distance to the loading point can affect access arrangements."],
  ["Parking and restrictions", "Parking availability, permits, loading windows and building rules should be explained before the move."],
  ["Packing and preparation", "Full or partial packing, unpacking and materials may affect the services requested."],
  ["Specialist items", "Pianos, heavy objects and fragile belongings may need assessment before handling can be confirmed."],
  ["Date and timing", "Your preferred date, time and flexibility help establish what arrangements may be possible."],
  ["Storage requirements", "If you need storage, describe the items and expected duration so options can be discussed."],
];

export default function MovingCostGuidePage() {
  return <><section className="page-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Home</Link> / Moving cost guide</div><div className="eyebrow">Moving cost guide</div><h1>What affects a removals quotation?</h1><p>Understand the details that help a moving company review your requirements. Prices depend on the move and should be confirmed individually.</p></div></section><section className="section"><div className="container content-wrap">{factors.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}<p className="disclaimer">No fixed prices or cost guarantees are provided here. Confirm all costs and inclusions in writing before booking.</p><div className="quote-banner" style={{ marginTop: 30 }}><div><h2>Request an individual quotation</h2><p>Share your route, inventory and moving requirements.</p></div><Link className="button" href="/quote">Get a quote <span>↗</span></Link></div></div></section></>;
}
