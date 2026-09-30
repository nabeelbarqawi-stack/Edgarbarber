import { NextResponse, type NextRequest } from "next/server";
import { unsubscribe } from "@/lib/unsubscribe";

/** One-click unsubscribe (RFC 8058) used by mail clients via the List-Unsubscribe-Post header. */
export async function POST(request: NextRequest) {
  const result = await unsubscribe(request.nextUrl.searchParams.get("token"));
  const status = result === "unsubscribed" ? 200 : result === "invalid" ? 400 : 503;
  return NextResponse.json({ result }, { status });
}
