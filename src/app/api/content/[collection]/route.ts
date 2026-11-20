import { NextResponse } from "next/server";
import { listRecords } from "@/lib/database";

const publicCollections = new Set(["services", "locations", "neighbourhoods", "faqs", "guides"]);

export async function GET(_request: Request, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!publicCollections.has(collection)) return NextResponse.json({ error: "Unknown public content collection." }, { status: 404 });
  return NextResponse.json(listRecords(collection, "", 1, 500), {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
