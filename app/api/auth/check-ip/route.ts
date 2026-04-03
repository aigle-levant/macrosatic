import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIp } from "next-request-ip";
import { headers } from "next/headers";

export async function GET() {
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

  // ✅ FIXED: Use next-request-ip
  const headersList = await headers();
  const ip = getClientIp(headersList);

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
