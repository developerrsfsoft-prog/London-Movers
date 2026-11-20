"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import SeoManager from "@/components/SeoManager";
import AdminContentManager from "@/components/AdminContentManager";

type SessionState = { configured: boolean; authenticated: boolean; email: string | null };
type Enquiry = { id: string; reference: string; kind: string; status: string; createdAt: string; data: Record<string, unknown> };
const navigation: Array<[string, string[]]> = [
  ["WORKSPACE", ["Overview", "Enquiries"]],
  ["CONTENT", ["Services", "Boroughs", "Neighbourhoods", "Streets", "Postcodes", "FAQs", "Moving guides", "Keywords", "Website settings", "Email settings"]],
];
const collectionFor: Record<string, string> = {
  Services: "services", Boroughs: "locations", Neighbourhoods: "neighbourhoods",
  Streets: "streets", Postcodes: "postcodes", FAQs: "faqs", "Moving guides": "guides",
  "Website settings": "settings",
};

function AdminLogin({ configured, onSignedIn }: { configured: boolean; onSignedIn: (session: SessionState) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { error?: string; authenticated?: boolean };
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      onSignedIn({ configured: true, authenticated: true, email });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="admin-login">
    <div className="admin-brand"><span className="brand-mark">LM</span><span><b>London Movers</b><small>SECURE ADMINISTRATION</small></span></div>
    <div className="admin-login-card">
      <div className="kicker">Management workspace</div><h1>Sign in</h1>
      <p>Use your administrator credentials to manage website content and enquiries.</p>
      {!configured ? <div className="seo-warning"><b>Admin access is not configured.</b><br />Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in the server environment, then restart the application. No default credentials are provided.</div> : <form onSubmit={submit}>
        <label className="field">Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="field">Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <span>↗</span></button>
      </form>}
    </div>
    <Link href="/" className="admin-return">← Back to website</Link>
  </section>;
}

function EnquiryManager() {
  const [records, setRecords] = useState<Enquiry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/enquiries?pageSize=100");
      const result = await response.json() as { records?: Enquiry[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to load enquiries.");
      setRecords(result.records || []);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const updateStatus = async (id: string, status: string) => {
    setError("");
    try {
      const response = await fetch("/api/admin/enquiries", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to update enquiry.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update enquiry.");
    }
  };

  if (loading) return <div className="admin-panel admin-empty">Loading enquiries…</div>;
  return <section className="admin-panel">
    <div className="admin-panel-heading"><h2>Customer enquiries</h2><span className="pill">{records.length} records</span></div>
    {error && <p className="error-message" role="alert">{error}</p>}
    {!records.length ? <div className="admin-empty"><b>No enquiries have been received</b><small>Submitted quote requests will appear here with their reference numbers.</small></div> :
      <div className="admin-enquiry-list">{records.map((record) => <details className="admin-enquiry" key={record.id}>
        <summary><span><b>{String(record.data.name || "Customer")}</b><small>{record.reference} · {record.kind} · {new Date(record.createdAt).toLocaleString("en-GB")}</small></span><select aria-label={`Status for ${record.reference}`} value={record.status} onClick={(event) => event.stopPropagation()} onChange={(event) => void updateStatus(record.id, event.target.value)}><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="archived">Archived</option></select></summary>
        <div className="admin-enquiry-details">{Object.entries(record.data).filter(([key, value]) => key !== "website" && value !== "" && value !== false && value !== null).map(([key, value]) => <p key={key}><b>{key.replace(/([A-Z])/g, " $1")}</b><span>{String(value)}</span></p>)}</div>
      </details>)}</div>}
  </section>;
}

export default function ConnectedAdminDashboard() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [active, setActive] = useState("Overview");
  const [counts, setCounts] = useState({ enquiries: 0, services: 0, locations: 0, keywords: 0 });

  useEffect(() => {
    fetch("/api/admin/session").then((response) => response.json()).then((value: SessionState) => setSession(value))
      .catch(() => setSession({ configured: false, authenticated: false, email: null }));
  }, []);

  useEffect(() => {
    if (!session?.authenticated) return;
    Promise.all(["enquiries", "services", "locations", "keywords"].map(async (collection) => {
      const response = await fetch(`/api/admin/${collection}?pageSize=1`);
      if (!response.ok) return 0;
      const result = await response.json() as { total?: number };
      return result.total || 0;
    })).then(([enquiries, services, locations, keywords]) => setCounts({ enquiries, services, locations, keywords }));
  }, [session?.authenticated]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession((current) => current ? { ...current, authenticated: false, email: null } : current);
  };

  if (!session) return <div className="admin-login-loading">Loading secure workspace…</div>;
  if (!session.authenticated) return <AdminLogin configured={session.configured} onSignedIn={setSession} />;

  return <div className="admin-preview connected-admin">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="brand-mark">LM</span><span><b>London Movers</b><small>ADMIN WORKSPACE</small></span></div>
      {navigation.map(([group, items]) => <div key={group}><div className="admin-nav-label">{group}</div>{items.map((item) => <button className={active === item ? "admin-nav-item selected" : "admin-nav-item"} key={item} onClick={() => setActive(item)}><span>{item === "Overview" ? "⌂" : item === "Enquiries" ? "▤" : item === "Services" ? "↗" : "◦"}</span>{item}</button>)}</div>)}
      <Link className="admin-return" href="/">← Back to website</Link>
    </aside>
    <section className="admin-content">
      <div className="admin-topbar"><div><span className="muted-small">Workspace / </span><b>{active}</b></div><div className="admin-topbar-actions"><span>{session.email}</span><button type="button" onClick={logout}>Sign out</button></div></div>
      <div className="admin-content-inner">
        <div className="admin-page-heading"><div><div className="kicker">London Movers administration</div><h1>{active}</h1><p>Manage enquiries and website content in the persistent project database.</p></div><div className="admin-user"><span>{session.email?.slice(0, 1).toUpperCase()}</span><div><b>Administrator</b><small>Secure session</small></div></div></div>
        {active === "Overview" && <>
          <div className="admin-stat-grid">{[["Enquiries", counts.enquiries, "Persistent customer requests"], ["Services", counts.services, "Directory records"], ["London areas", counts.locations, "Borough records"], ["SEO keywords", counts.keywords, "Mapped search terms"]].map(([label, count, note]) => <article className="admin-stat" key={label}><span>{label}</span><b>{count}</b><small>{note}</small></article>)}</div>
          <section className="admin-panel"><div className="admin-panel-heading"><h2>Workspace shortcuts</h2></div><div className="admin-quick-actions">{["Enquiries", "Services", "Boroughs", "Keywords"].map((item) => <button key={item} onClick={() => setActive(item)}>{item}<span>↗</span></button>)}</div></section>
          <section className="admin-panel"><div className="admin-panel-heading"><h2>Configuration</h2></div><p className="disclaimer">Enquiry emails are sent when valid SMTP credentials are set in the server environment. Admin access is configured with server-side credentials; no secrets are stored in the browser or database.</p></section>
        </>}
        {active === "Enquiries" && <EnquiryManager />}
        {active === "Keywords" && <div className="admin-panel"><SeoManager /></div>}
        {active === "Email settings" && <section className="admin-panel"><h2>Email delivery</h2><p>SMTP credentials are read from server-only environment variables. Configure <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, <code>SMTP_PASSWORD</code>, <code>MAIL_FROM</code> and <code>ENQUIRY_TO</code>, then restart the server. Secrets are not editable or exposed in this dashboard.</p></section>}
        {collectionFor[active] && <div className="admin-panel"><AdminContentManager collection={collectionFor[active]} /></div>}
      </div>
    </section>
  </div>;
}
