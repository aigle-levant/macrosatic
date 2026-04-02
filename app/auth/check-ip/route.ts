import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getClientIP(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;

  return "unknown";
}

export async function GET(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (err) {
            console.error("Cookie error:", err);
          }
        },
      },
    },
  );

  // ✅ Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User fetch error:", userError?.message);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ✅ Get IP properly
  const ip = getClientIP(request);

  console.log("Checking IP:", ip, "for user:", user.id);

  // ✅ Check DB
  const { data, error } = await supabase
    .from("user_ip")
    .select("id")
    .eq("user_id", user.id)
    .eq("ip_address", ip)
    .maybeSingle();

  if (error) {
    console.error("DB error:", error.message);
  }

  return NextResponse.json({
    trusted: !!data,
    ip,
  });
}
