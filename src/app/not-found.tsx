import Link from "next/link";

export default function NotFound() {
  return <section className="not-found"><div className="kicker">Page not found</div><h1>That page has moved.</h1><p>The link may be incorrect, or the page may no longer be available.</p><Link className="button" href="/">Return to homepage <span>↗</span></Link></section>;
}
