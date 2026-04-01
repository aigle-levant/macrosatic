// lib/get-ip.ts

import { headers } from "next/headers";

export async function getClientIP() {
  const headersList = await headers();

  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");

  const ip = forwarded?.split(",")[0].trim() || realIP || "unknown";

  return ip;
}
