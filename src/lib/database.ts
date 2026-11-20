import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { articles, allNeighbourhoods, faqs, locations, regions, services } from "../../data";
import { initialKeywords } from "../data/seoKeywords";

type SqliteStatement = {
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
};

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
};

const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (filename: string) => SqliteDatabase;
};

const databasePath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "london-movers.sqlite");
mkdirSync(path.dirname(databasePath), { recursive: true });

export const database = new DatabaseSync(databasePath);
database.exec("PRAGMA busy_timeout = 10000");
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS content_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`);

function seed(collection: string, records: Array<{ id: string; [key: string]: unknown }>) {
  const exists = database.prepare("SELECT 1 FROM content_records WHERE collection = ? LIMIT 1").get(collection);
  if (exists) return;
  const insert = database.prepare("INSERT OR IGNORE INTO content_records (collection, id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
  const now = new Date().toISOString();
  for (const { id, ...data } of records) insert.run(collection, id, JSON.stringify({ ...data, id }), now, now);
}

seed("services", services.map((item) => ({ id: item.slug, ...item })));
seed("locations", locations.map((item) => ({ id: item.slug, ...item })));
seed("neighbourhoods", allNeighbourhoods.map((item) => ({ id: `${item.regionSlug}:${item.slug}`, ...item })));
seed("faqs", faqs.map(([question, answer], index) => ({ id: `faq-${index + 1}`, question, answer })));
seed("guides", articles.map((item) => ({ id: item.slug, ...item, status: "Published" })));
seed("keywords", initialKeywords);
database.prepare("UPDATE content_records SET data = json_set(data, '$.status', 'Published') WHERE collection = 'guides' AND json_type(data, '$.status') IS NULL").run();

export const collections = new Set([
  "services", "locations", "neighbourhoods", "streets", "postcodes",
  "faqs", "guides", "keywords", "settings",
]);

export function isKnownRegion(slug: string) {
  return regions.some((region) => region.slug === slug);
}

export function getRegionName(slug: string) {
  return regions.find((region) => region.slug === slug)?.name || null;
}

export function getKeywordMetadata(targetUrl: string) {
  const row = database.prepare(`
    SELECT data FROM content_records
    WHERE collection = 'keywords' AND json_extract(data, '$.targetUrl') = ?
    ORDER BY CASE json_extract(data, '$.role') WHEN 'Primary' THEN 0 ELSE 1 END
    LIMIT 1
  `).get(targetUrl);
  return row ? JSON.parse(String(row.data)) as { seoTitle?: string; metaDescription?: string; indexStatus?: string } : null;
}

export function listRecords(collection: string, query: string, page: number, pageSize: number) {
  const term = `%${query}%`;
  const total = database.prepare(
    "SELECT COUNT(*) AS count FROM content_records WHERE collection = ? AND data LIKE ?",
  ).get(collection, term)?.count as number || 0;
  const rows = database.prepare(
    "SELECT data FROM content_records WHERE collection = ? AND data LIKE ? ORDER BY updated_at DESC LIMIT ? OFFSET ?",
  ).all(collection, term, pageSize, (page - 1) * pageSize);
  return { records: rows.map((row) => JSON.parse(String(row.data))), total, page, pageSize };
}

export function getRecord(collection: string, id: string) {
  const row = database.prepare("SELECT data FROM content_records WHERE collection = ? AND id = ?").get(collection, id);
  return row ? JSON.parse(String(row.data)) as Record<string, unknown> : null;
}

export function findRecordBySlug(collection: string, slug: string, regionSlug?: string) {
  const row = regionSlug
    ? database.prepare("SELECT data FROM content_records WHERE collection = ? AND json_extract(data, '$.slug') = ? AND json_extract(data, '$.regionSlug') = ? LIMIT 1").get(collection, slug, regionSlug)
    : database.prepare("SELECT data FROM content_records WHERE collection = ? AND json_extract(data, '$.slug') = ? LIMIT 1").get(collection, slug);
  return row ? JSON.parse(String(row.data)) as Record<string, unknown> : null;
}

export function saveRecord(collection: string, value: Record<string, unknown>, id?: string) {
  const semanticId = collection === "neighbourhoods" ? `${value.regionSlug}:${value.slug}`
    : ["services", "locations", "guides"].includes(collection) ? value.slug : undefined;
  const recordId = id || String(value.id || semanticId || randomUUID());
  const data = { ...value, id: recordId };
  const now = new Date().toISOString();
  database.prepare(`
    INSERT INTO content_records (collection, id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(collection, recordId, JSON.stringify(data), now, now);
  return data;
}

export function deleteRecord(collection: string, id: string) {
  return database.prepare("DELETE FROM content_records WHERE collection = ? AND id = ?").run(collection, id).changes > 0;
}

export function createEnquiry(kind: string, value: Record<string, unknown>) {
  const id = randomUUID();
  const reference = `LM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  database.prepare(
    "INSERT INTO enquiries (id, reference, kind, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, reference, kind, JSON.stringify(value), now, now);
  return { id, reference, createdAt: now };
}

export function listEnquiries(page: number, pageSize: number) {
  const total = database.prepare("SELECT COUNT(*) AS count FROM enquiries").get()?.count as number || 0;
  const records = database.prepare(
    "SELECT id, reference, kind, status, data, created_at AS createdAt, updated_at AS updatedAt FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?",
  ).all(pageSize, (page - 1) * pageSize).map((row) => ({ ...row, data: JSON.parse(String(row.data)) }));
  return { records, total, page, pageSize };
}

export function updateEnquiryStatus(id: string, status: string) {
  return database.prepare("UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, new Date().toISOString(), id).changes > 0;
}

export function createAdminSession(tokenHash: string, email: string, expiresAt: string) {
  database.prepare("INSERT INTO admin_sessions (token_hash, email, expires_at) VALUES (?, ?, ?)").run(tokenHash, email, expiresAt);
}

export function findAdminSession(tokenHash: string) {
  return database.prepare("SELECT email, expires_at AS expiresAt FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .get(tokenHash, new Date().toISOString()) as { email: string; expiresAt: string } | undefined;
}

export function deleteAdminSession(tokenHash: string) {
  database.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(tokenHash);
}
