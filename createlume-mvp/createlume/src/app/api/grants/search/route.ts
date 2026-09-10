import { NextRequest, NextResponse } from "next/server";
import { searchFederalGrants } from "@/lib/grants-gov";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ error: "Missing required ?keyword= param" }, { status: 400 });
  }
  try {
    const hits = await searchFederalGrants({ keyword, rows: 25 });
    return NextResponse.json({ hits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
