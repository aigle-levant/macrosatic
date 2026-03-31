import { headers } from "next/headers";

export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Vercel / proxies set this
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Fallback
  return headersList.get("x-real-ip") ?? "unknown";
}
