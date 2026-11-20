"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type RecordValue = { id: string; [key: string]: unknown };
type Field = { key: string; label: string; type?: "select" | "textarea" | "checkbox"; options?: string[]; required?: boolean };

const configs: Record<string, { title: string; fields: Field[] }> = {
  services: { title: "Services", fields: [{ key: "name", label: "Service name", required: true }, { key: "slug", label: "URL slug", required: true }, { key: "category", label: "Category", required: true }, { key: "summary", label: "Summary", type: "textarea", required: true }] },
  locations: { title: "Boroughs and authorities", fields: [{ key: "name", label: "Name", required: true }, { key: "slug", label: "URL slug", required: true }, { key: "regionSlug", label: "Region slug", required: true }, { key: "regionName", label: "Region name" }, { key: "type", label: "Type" }] },
  neighbourhoods: { title: "Neighbourhoods", fields: [{ key: "name", label: "Name", required: true }, { key: "slug", label: "URL slug", required: true }, { key: "regionSlug", label: "Region slug", required: true }, { key: "regionName", label: "Region name" }] },
  streets: { title: "Streets", fields: [{ key: "name", label: "Street name", required: true }, { key: "slug", label: "URL slug" }, { key: "neighbourhoodId", label: "Verified neighbourhood id", required: true }, { key: "verified", label: "I confirm this street and parent relationship were verified", type: "checkbox", required: true }] },
  postcodes: { title: "Postcodes", fields: [{ key: "postcode", label: "Postcode", required: true }, { key: "neighbourhoodId", label: "Verified neighbourhood id", required: true }, { key: "verified", label: "I confirm this postcode and parent relationship were verified", type: "checkbox", required: true }] },
  faqs: { title: "FAQs", fields: [{ key: "question", label: "Question", required: true }, { key: "answer", label: "Answer", type: "textarea", required: true }, { key: "category", label: "Category" }] },
  guides: { title: "Moving guides", fields: [{ key: "title", label: "Guide title", required: true }, { key: "slug", label: "URL slug", required: true }, { key: "summary", label: "Summary", type: "textarea" }, { key: "content", label: "Content", type: "textarea" }, { key: "status", label: "Status", type: "select", options: ["Draft", "Published"], required: true }] },
  settings: { title: "Website settings", fields: [{ key: "key", label: "Setting key", required: true }, { key: "value", label: "Value", type: "textarea" }] },
};

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json() as { error?: string; records?: RecordValue[]; record?: RecordValue; total?: number };
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body;
}

export default function AdminContentManager({ collection }: { collection: string }) {
  const config = configs[collection];
  const [records, setRecords] = useState<RecordValue[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RecordValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestJson(`/api/admin/${collection}?q=${encodeURIComponent(search)}&pageSize=100`);
      setRecords(result.records || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [collection, search]);

  useEffect(() => { void load(); }, [load]);
  if (!config) return <p className="error-message">This content type is not available.</p>;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/admin/${collection}`, {
        method: "POST",
        body: JSON.stringify(editing),
      });
      setEditing(null);
      setNotice("Changes saved.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (record: RecordValue) => {
    if (!window.confirm(`Delete "${String(record.name || record.title || record.question || record.key || record.keyword || record.id)}"? This cannot be undone.`)) return;
    setError("");
    try {
      await requestJson(`/api/admin/${collection}?id=${encodeURIComponent(record.id)}`, { method: "DELETE" });
      setNotice("Record deleted.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete this record.");
    }
  };

  return <section className="admin-content-manager">
    <div className="admin-panel-heading">
      <div><h2>{config.title}</h2><small>{records.length} records · saved to the project database</small></div>
      <button className="admin-action-button" type="button" onClick={() => { setError(""); setEditing({ id: "", ...Object.fromEntries(config.fields.map((field) => [field.key, ""])) }); }}>＋ Add record</button>
    </div>
    <label className="admin-search"><span>Search records</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} /></label>
    {error && <p className="error-message" role="alert">{error}</p>}
    {notice && <p className="seo-session-notice" role="status">{notice}</p>}
    {editing && <form className="admin-record-form" onSubmit={save}>
      <h3>{records.some((item) => item.id === editing.id) ? "Edit record" : "New record"}</h3>
      <div className="admin-record-fields">{config.fields.map((field) => <label key={field.key}>{field.label}{field.required && " *"}
        {field.type === "checkbox"
          ? <input type="checkbox" required={field.required} checked={editing[field.key] === true} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.checked })} />
          : field.type === "textarea"
          ? <textarea required={field.required} value={String(editing[field.key] || "")} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} />
          : field.type === "select"
            ? <select required={field.required} value={String(editing[field.key] || "")} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })}><option value="">Select</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>
            : <input required={field.required} value={String(editing[field.key] || "")} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} />}
      </label>)}</div>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="form-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="button" disabled={busy}>{busy ? "Saving…" : "Save record"}</button></div>
    </form>}
    <div className="admin-record-list">
      {loading ? <p className="admin-empty">Loading records…</p> : records.length === 0 ? <p className="admin-empty">No records found.</p> : records.map((record) => {
        const title = String(record.name || record.title || record.question || record.key || record.keyword || record.postcode || record.id);
        const subtitle = String(record.summary || record.answer || record.targetUrl || record.regionName || record.neighbourhoodId || record.category || "");
        return <article className="admin-record" key={record.id}><div><b>{title}</b><small>{subtitle}</small><code>{record.id}</code></div><div className="admin-record-actions"><button type="button" onClick={() => { setError(""); setEditing({ ...record }); }}>Edit</button><button type="button" className="danger-link" onClick={() => void remove(record)}>Delete</button></div></article>;
      })}
    </div>
  </section>;
}
