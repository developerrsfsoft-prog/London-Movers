import Link from "next/link";

type Props = {
  title: string;
  description: string;
  label?: string;
};

export default function ConversionPanel({ title, description, label = "Request a quote" }: Props) {
  return <aside className="detail-sidebar" aria-label="Request a moving quotation">
    <div className="detail-card">
      <div className="detail-card-count">A CLEAR 7-STEP ENQUIRY</div>
      <div className="kicker">Plan your move</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <ul>
        <li>Addresses and property details</li>
        <li>Inventory and access requirements</li>
        <li>Preferred date and contact details</li>
      </ul>
      <Link className="button" href="/quote">{label}<span>↗</span></Link>
      <small>An enquiry is not a confirmed booking. Availability and arrangements are confirmed individually.</small>
    </div>
    <Link className="detail-secondary-link" href="/contact">Have a question first? Contact us <span>↗</span></Link>
  </aside>;
}
