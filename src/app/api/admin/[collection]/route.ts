import { NextRequest, NextResponse } from "next/server";
import { collections, deleteRecord, getRecord, getRegionName, isKnownRegion, listEnquiries, listRecords, saveRecord, updateEnquiryStatus } from "@/lib/database";
import { getAdminSession } from "@/lib/adminAuth";

type Context = { params: Promise<{ collection: string }> };
const allowedFields: Record<string, string[]> = {
  services: ["name", "summary", "category", "slug"],
  locations: ["name", "slug", "regionSlug", "regionName", "type"],
  neighbourhoods: ["name", "slug", "regionSlug", "regionName", "type"],
  streets: ["name", "slug", "neighbourhoodId", "verified"],
  postcodes: ["postcode", "neighbourhoodId", "verified"],
  faqs: ["question", "answer", "category"],
  guides: ["title", "summary", "slug", "content", "status"],
  keywords: ["keyword", "role", "cluster", "intent", "targetUrl", "pageType", "service", "location", "searchVolume", "difficulty", "cpc", "priority", "researchSource", "researchDate", "rankingPosition", "indexStatus", "contentStatus", "seoTitle", "metaDescription"],
  settings: ["key", "value"],
};

function validateRecord(collection: string, input: Record<string, unknown>) {
  const fields = allowedFields[collection];
  if (!fields) return "Unknown content collection.";
  if (Object.keys(input).some((key) => !fields.includes(key) && key !== "id")) return "The record contains unsupported fields.";
  if (Object.values(input).some((value) => !(typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) || (typeof value === "string" && value.length > 20000))) {
    return "A field is invalid or exceeds the maximum length.";
  }
  if (collection === "keywords" && ["searchVolume", "difficulty", "cpc", "rankingPosition"].some((key) => input[key] !== null && input[key] !== undefined)) {
    return "Research metrics can only be saved when verified source data is available.";
  }
  const required = collection === "services" ? ["name", "summary", "category", "slug"]
    : collection === "locations" || collection === "neighbourhoods" ? ["name", "slug", "regionSlug"]
      : collection === "faqs" ? ["question", "answer"]
        : collection === "keywords" ? ["keyword", "targetUrl", "intent", "role", "cluster", "priority", "indexStatus", "contentStatus"]
          : collection === "settings" ? ["key"]
            : collection === "postcodes" ? ["postcode", "neighbourhoodId"]
              : collection === "streets" ? ["name", "neighbourhoodId"]
                : collection === "guides" ? ["title", "slug", "status"] : ["title", "slug"];
  if (required.some((key) => typeof input[key] !== "string" || !(input[key] as string).trim())) return `Required fields: ${required.join(", ")}.`;
  if (collection === "guides" && !["Draft", "Published"].includes(String(input.status))) return "Guide status must be Draft or Published.";
  if (["services", "locations", "neighbourhoods"].includes(collection) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(input.slug))) return "URL slugs may contain lowercase letters, numbers and single hyphens only.";
  if (["locations", "neighbourhoods"].includes(collection) && !isKnownRegion(String(input.regionSlug))) return "Select a known London website region.";
  if (collection === "keywords") {
    if (!String(input.targetUrl).startsWith("/") || String(input.targetUrl).startsWith("//")) return "Target URL must be a local path.";
    if (!["Primary", "Secondary"].includes(String(input.role))) return "Keyword assignment must be Primary or Secondary.";
    if (!["Commercial", "Transactional", "Informational", "Local"].includes(String(input.intent))) return "Select a valid search intent.";
    if (!["High", "Medium", "Low"].includes(String(input.priority))) return "Select a valid keyword priority.";
    if (!["Index", "Noindex until verified"].includes(String(input.indexStatus))) return "Select a valid index status.";
    if (!["Draft", "Needs review", "Ready"].includes(String(input.contentStatus))) return "Select a valid content status.";
  }
  if (["postcodes", "streets"].includes(collection)) {
    const parent = getRecord("neighbourhoods", String(input.neighbourhoodId));
    if (!parent) return "Select an existing neighbourhood record as the verified parent.";
    if (input.verified !== true) return `${collection === "postcodes" ? "Postcode" : "Street"} records must be marked verified.`;
  }
  if (collection === "postcodes" && !/^(GIR 0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i.test(String(input.postcode).trim())) return "Enter a valid UK postcode.";
  return null;
}

async function authorize() {
  return Boolean(await getAdminSession());
}

export async function GET(request: NextRequest, { params }: Context) {
  if (!await authorize()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { collection } = await params;
  const page = Math.max(1, Math.min(10000, Number(request.nextUrl.searchParams.get("page")) || 1));
  const pageSize = Math.max(1, Math.min(500, Number(request.nextUrl.searchParams.get("pageSize")) || 25));
  if (collection === "enquiries") return NextResponse.json(listEnquiries(page, pageSize));
  if (!collections.has(collection)) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });
  return NextResponse.json(listRecords(collection, (request.nextUrl.searchParams.get("q") || "").slice(0, 200), page, pageSize));
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!await authorize()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { collection } = await params;
  if (!collections.has(collection)) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "A record object is required." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const validationError = validateRecord(collection, input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  if (["services", "locations", "neighbourhoods", "guides"].includes(collection)) {
    const slugMatches = listRecords(collection, String(input.slug), 1, 500).records;
    const duplicate = slugMatches.find((record) => record.slug === input.slug && record.id !== input.id);
    if (duplicate) return NextResponse.json({ error: "This URL slug is already in use in this content collection." }, { status: 409 });
  }
  if (collection === "keywords") {
    const duplicate = listRecords(collection, String(input.keyword), 1, 500).records.some((record) =>
      String(record.keyword).toLowerCase() === String(input.keyword).toLowerCase() && record.id !== input.id && record.targetUrl !== input.targetUrl);
    if (duplicate) return NextResponse.json({ error: "This keyword is already mapped to a different URL." }, { status: 409 });
  }
  try {
    const recordInput = ["locations", "neighbourhoods"].includes(collection)
      ? { ...input, regionName: getRegionName(String(input.regionSlug)) }
      : collection === "postcodes" ? { ...input, postcode: String(input.postcode).toUpperCase().replace(/\s+/g, " ").trim() } : input;
    const record = saveRecord(collection, recordInput, collection === "settings" && !input.id ? String(input.key) : undefined);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Unable to save admin content", { collection, error });
    return NextResponse.json({ error: "Unable to save this record." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  if (!await authorize()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { collection } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "A record object is required." }, { status: 400 });
  if (collection === "enquiries") {
    const { id, status } = body as { id?: unknown; status?: unknown };
    if (typeof id !== "string" || !["new", "in_progress", "completed", "archived"].includes(String(status))) return NextResponse.json({ error: "Invalid enquiry status." }, { status: 400 });
    if (!updateEnquiryStatus(id, String(status))) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    return NextResponse.json({ updated: true });
  }
  if (!collections.has(collection)) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });
  const input = body as Record<string, unknown>;
  if (typeof input.id !== "string") return NextResponse.json({ error: "Record id is required." }, { status: 400 });
  if (!getRecord(collection, input.id)) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  const validationError = validateRecord(collection, input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  if (collection === "keywords") {
    const duplicate = listRecords(collection, String(input.keyword), 1, 500).records.some((record) =>
      String(record.keyword).toLowerCase() === String(input.keyword).toLowerCase() && record.id !== input.id && record.targetUrl !== input.targetUrl);
    if (duplicate) return NextResponse.json({ error: "This keyword is already mapped to a different URL." }, { status: 409 });
  }
  const recordInput = ["locations", "neighbourhoods"].includes(collection)
    ? { ...input, regionName: getRegionName(String(input.regionSlug)) }
    : collection === "postcodes" ? { ...input, postcode: String(input.postcode).toUpperCase().replace(/\s+/g, " ").trim() } : input;
  const updated = saveRecord(collection, recordInput, input.id);
  return NextResponse.json({ record: updated });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  if (!await authorize()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { collection } = await params;
  if (!collections.has(collection)) return NextResponse.json({ error: "Unknown content collection." }, { status: 404 });
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id || id.length > 200) return NextResponse.json({ error: "A valid record id is required." }, { status: 400 });
  if (!deleteRecord(collection, id)) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
