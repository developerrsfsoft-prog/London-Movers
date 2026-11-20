"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { initialKeywords, keywordTargetPages, type KeywordRecord } from "@/data/seoKeywords";

const pageSize = 12;

function csvCell(value: string | number | null) {
  const text = value === null ? "Not researched" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export default function SeoManager() {
  const [records, setRecords] = useState(initialKeywords);
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("All clusters");
  const [intent, setIntent] = useState("All intents");
  const [role, setRole] = useState("All assignments");
  const [sort, setSort] = useState<"keyword" | "priority">("keyword");
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState("");
  const [connected, setConnected] = useState(false);
  const [newKeyword, setNewKeyword] = useState(false);
  const [newValues, setNewValues] = useState({ keyword: "", targetUrl: "", cluster: "", intent: "Commercial", role: "Primary" });
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/keywords?pageSize=500").then(async (response) => {
      const result = await response.json() as { records?: KeywordRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to load saved keywords.");
      setRecords(result.records || []);
      setConnected(true);
    }).catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Unable to load saved keywords."));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchText = !term || `${record.keyword} ${record.cluster} ${record.targetUrl} ${record.location} ${record.service}`.toLowerCase().includes(term);
      return matchText && (cluster === "All clusters" || record.cluster === cluster) &&
        (intent === "All intents" || record.intent === intent) &&
        (role === "All assignments" || record.role === role);
    }).sort((a, b) => sort === "keyword" ? a.keyword.localeCompare(b.keyword) : ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority));
  }, [records, query, cluster, intent, role, sort]);
  const duplicates = useMemo(() => {
    const byTerm = new Map<string, Set<string>>();
    for (const record of records) {
      const key = record.keyword.trim().toLowerCase();
      const targets = byTerm.get(key) || new Set<string>();
      targets.add(record.targetUrl);
      byTerm.set(key, targets);
    }
    return [...byTerm.entries()].filter(([, targets]) => targets.size > 1).length;
  }, [records]);
  const primaryConflicts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of records.filter((item) => item.role === "Primary")) counts.set(record.targetUrl, (counts.get(record.targetUrl) || 0) + 1);
    return [...counts.values()].filter((count) => count > 1).length;
  }, [records]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const pageRecords = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const clusters = [...new Set(records.map((record) => record.cluster))].sort((a, b) => a.localeCompare(b));

  const update = (id: string, patch: Partial<KeywordRecord>) => {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, ...patch } : record));
    setNotice("Unsaved changes. Save this keyword to keep them.");
  };
  const save = async (record: KeywordRecord) => {
    setNotice("");
    try {
      const response = await fetch("/api/admin/keywords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save this keyword.");
      setNotice(`Saved “${record.keyword}”.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save this keyword.");
    }
  };
  const remove = async (record: KeywordRecord) => {
    if (!window.confirm(`Delete the keyword “${record.keyword}”?`)) return;
    try {
      const response = await fetch(`/api/admin/keywords?id=${encodeURIComponent(record.id)}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to delete this keyword.");
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setNotice(`Deleted “${record.keyword}”.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete this keyword.");
    }
  };
  const create = async () => {
    const keyword = newValues.keyword.trim();
    const targetUrl = newValues.targetUrl.trim();
    if (!keyword || !targetUrl.startsWith("/") || targetUrl.startsWith("//")) {
      setNotice("Enter a keyword and a valid internal target URL.");
      return;
    }
    const id = `kw-${crypto.randomUUID()}`;
    const record: KeywordRecord = {
      ...initialKeywords[0], id, keyword, targetUrl, cluster: newValues.cluster.trim() || "Unclustered",
      intent: newValues.intent as KeywordRecord["intent"], role: newValues.role as KeywordRecord["role"],
      searchVolume: null, difficulty: null, cpc: null, rankingPosition: null,
      researchSource: "Not researched", researchDate: "Not researched", contentStatus: "Needs review",
      priority: "Medium", indexStatus: "Noindex until verified", seoTitle: "", metaDescription: "",
      pageType: "Other", service: "", location: "",
    };
    try {
      const response = await fetch("/api/admin/keywords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      const result = await response.json() as { error?: string; record?: KeywordRecord };
      if (!response.ok) throw new Error(result.error || "Unable to add this keyword.");
      setRecords((current) => [result.record || record, ...current]);
      setNewKeyword(false);
      setNewValues({ keyword: "", targetUrl: "", cluster: "", intent: "Commercial", role: "Primary" });
      setNotice("Keyword added.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to add this keyword.");
    }
  };
  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const rows = parseCsv(await file.text());
    if (rows.length < 2) { setNotice("The CSV file does not contain keyword rows."); return; }
    const headers = rows[0].map((header) => header.trim());
    const imported: KeywordRecord[] = [];
    try {
      for (const values of rows.slice(1)) {
        const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
        if (!row.keyword || !row.targetUrl) continue;
        const record = {
          ...initialKeywords[0],
          ...row,
          id: String(row.id || `kw-${crypto.randomUUID()}`),
          keyword: String(row.keyword), targetUrl: String(row.targetUrl),
          searchVolume: null, difficulty: null, cpc: null, rankingPosition: null,
          researchSource: "Not researched", researchDate: "Not researched",
        } as KeywordRecord;
        const response = await fetch("/api/admin/keywords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
        const result = await response.json() as { error?: string; record?: KeywordRecord };
        if (!response.ok) throw new Error(`${record.keyword}: ${result.error || "Import failed."}`);
        imported.push(result.record || record);
      }
      setRecords((current) => [...imported, ...current.filter((record) => !imported.some((item) => item.id === record.id))]);
      setNotice(`Imported ${imported.length} keyword${imported.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setNotice(`${imported.length} imported before error: ${error instanceof Error ? error.message : "Import failed."}`);
    }
  };
  const exportCsv = () => {
    const columns: (keyof KeywordRecord)[] = ["id", "keyword", "role", "cluster", "intent", "targetUrl", "pageType", "service", "location", "searchVolume", "difficulty", "cpc", "priority", "researchSource", "researchDate", "rankingPosition", "indexStatus", "contentStatus", "seoTitle", "metaDescription"];
    const csv = [columns.map(csvCell).join(","), ...filtered.map((record) => columns.map((column) => csvCell(record[column] as string | number | null)).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "london-movers-keyword-map.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="seo-manager">
    <div className="seo-manager-header"><div><div className="kicker">Organic search planning</div><h2>Keyword and page map</h2><p>Curated search terms mapped to intended pages. Metrics remain unresearched until supported by a UK keyword source.</p></div><div className="seo-manager-actions"><button className="admin-action-button" onClick={() => setNewKeyword((current) => !current)}>＋ Add keyword</button><button className="admin-action-button" onClick={() => importRef.current?.click()}>Import CSV ↑</button><button className="admin-action-button" onClick={exportCsv}>Export CSV ↓</button><input ref={importRef} hidden type="file" accept=".csv,text/csv" onChange={importCsv} /></div></div>
    {newKeyword && <div className="keyword-create"><label>Keyword<input value={newValues.keyword} onChange={(event) => setNewValues({ ...newValues, keyword: event.target.value })} /></label><label>Target URL<input value={newValues.targetUrl} placeholder="/services/house-removals" onChange={(event) => setNewValues({ ...newValues, targetUrl: event.target.value })} /></label><label>Cluster<input value={newValues.cluster} onChange={(event) => setNewValues({ ...newValues, cluster: event.target.value })} /></label><label>Intent<select value={newValues.intent} onChange={(event) => setNewValues({ ...newValues, intent: event.target.value })}>{["Commercial", "Transactional", "Informational", "Local"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Assignment<select value={newValues.role} onChange={(event) => setNewValues({ ...newValues, role: event.target.value })}><option>Primary</option><option>Secondary</option></select></label><div><button className="admin-action-button" onClick={() => void create()}>Save keyword</button><button className="seo-cancel" onClick={() => setNewKeyword(false)}>Cancel</button></div></div>}
    <div className="seo-stats">
      <article><span>Tracked keywords</span><b>{records.length}</b><small>Strategy records</small></article>
      <article><span>Keyword conflicts</span><b>{duplicates}</b><small>Same term targeting multiple URLs</small></article>
      <article><span>Primary URL conflicts</span><b>{primaryConflicts}</b><small>Pages with multiple primary terms</small></article>
      <article><span>Metrics researched</span><b>0</b><small>Volume, difficulty, CPC and rank</small></article>
    </div>
    <div className="seo-warning"><b>Research status:</b> Search volume, difficulty, CPC and rankings are marked “Not researched”. Location URLs stay noindex until their coverage and unique local content are confirmed.</div>
    <div className="seo-filters">
      <label className="field"><span>Search keyword or URL</span><input type="search" value={query} onChange={(event) => { setPage(0); setQuery(event.target.value); }} placeholder="Search mapped keywords" /></label>
      <label className="field"><span>Cluster</span><select value={cluster} onChange={(event) => { setPage(0); setCluster(event.target.value); }}><option>All clusters</option>{clusters.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field"><span>Intent</span><select value={intent} onChange={(event) => { setPage(0); setIntent(event.target.value); }}><option>All intents</option>{["Commercial", "Transactional", "Informational", "Local"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field"><span>Assignment</span><select value={role} onChange={(event) => { setPage(0); setRole(event.target.value); }}><option>All assignments</option><option>Primary</option><option>Secondary</option></select></label>
      <label className="field"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as "keyword" | "priority")}><option value="keyword">Keyword A–Z</option><option value="priority">Priority</option></select></label>
    </div>
    {notice && <p className={notice.startsWith("Unable") || notice.includes("error:") ? "error-message" : "seo-session-notice"} role="status">{notice}</p>}
    {!connected && <p className="seo-warning">Connecting to the saved keyword database…</p>}
    <div className="table-wrap seo-table-wrap"><table className="seo-table"><thead><tr><th>Keyword</th><th>Cluster / intent</th><th>Target URL</th><th>Role</th><th>Volume</th><th>Difficulty</th><th>CPC</th><th>Priority</th><th>Index</th><th>Edit</th></tr></thead><tbody>
      {pageRecords.map((record) => <tr key={record.id}>
        <td><b>{record.keyword}</b><small>{record.pageType} · {record.location}</small></td>
        <td>{record.cluster}<small>{record.intent}</small></td>
        <td><code>{record.targetUrl}</code></td>
        <td><span className={record.role === "Primary" ? "seo-role primary" : "seo-role"}>{record.role}</span></td>
        <td>{record.searchVolume ?? "Not researched"}</td><td>{record.difficulty ?? "Not researched"}</td><td>{record.cpc === null ? "Not researched" : `£${record.cpc}`}</td>
        <td><select aria-label={`Priority for ${record.keyword}`} value={record.priority} onChange={(event) => update(record.id, { priority: event.target.value as KeywordRecord["priority"] })}><option>High</option><option>Medium</option><option>Low</option></select></td>
        <td><span className={record.indexStatus === "Index" ? "seo-index index" : "seo-index"}>{record.indexStatus === "Index" ? "Index" : "Noindex"}</span></td>
        <td><details className="seo-row-edit"><summary>Edit</summary><div>
          <label>Keyword<input value={record.keyword} onChange={(event) => update(record.id, { keyword: event.target.value })} /></label>
          <label>Target URL<input value={record.targetUrl} onChange={(event) => update(record.id, { targetUrl: event.target.value })} /></label>
          <label>Cluster<input value={record.cluster} onChange={(event) => update(record.id, { cluster: event.target.value })} /></label>
          <label>Search intent<select value={record.intent} onChange={(event) => update(record.id, { intent: event.target.value as KeywordRecord["intent"] })}>{["Commercial", "Transactional", "Informational", "Local"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Assignment<select value={record.role} onChange={(event) => update(record.id, { role: event.target.value as KeywordRecord["role"] })}><option>Primary</option><option>Secondary</option></select></label>
          <label>SEO title<input value={record.seoTitle} placeholder="Not set" onChange={(event) => update(record.id, { seoTitle: event.target.value })} /></label>
          <label>Meta description<textarea value={record.metaDescription} placeholder="Not set" onChange={(event) => update(record.id, { metaDescription: event.target.value })} /></label>
          <label>Page status<select value={record.indexStatus} onChange={(event) => update(record.id, { indexStatus: event.target.value as KeywordRecord["indexStatus"] })}><option>Noindex until verified</option><option>Index</option></select></label>
          <label>Content status<select value={record.contentStatus} onChange={(event) => update(record.id, { contentStatus: event.target.value as KeywordRecord["contentStatus"] })}><option>Draft</option><option>Needs review</option><option>Ready</option></select></label>
          <button className="admin-action-button" type="button" onClick={() => void save(record)}>Save changes</button>
          <button className="seo-delete" type="button" onClick={() => void remove(record)}>Delete keyword</button>
        </div></details></td>
      </tr>)}
      {!pageRecords.length && <tr><td colSpan={10}>No keywords match these filters.</td></tr>}
    </tbody></table></div>
    <div className="seo-pagination"><span>Showing {filtered.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</span><button disabled={(currentPage + 1) * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
    <div className="seo-metadata-audit"><h3>Metadata audit</h3><div>{keywordTargetPages.filter((target) => !target.title || !target.description).length} target pages need reviewed SEO titles and descriptions. Save approved, unique metadata only after the business confirms services and coverage.</div></div>
  </div>;
}
