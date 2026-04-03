import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "next-request-ip";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  return NextResponse.json({ ip });
}
