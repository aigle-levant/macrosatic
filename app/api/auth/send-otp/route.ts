import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/get-ip";

export async function POST() {
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
          } catch {}
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = await getClientIP();

  // ✅ FIXED: consistent column name + safe query
  const { data: existingIP } = await supabase
    .from("user_ip")
    .select("id")
    .eq("user_id", user.id)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existingIP) {
    return NextResponse.json({ trusted: true });
  }

  // ❗ send OTP
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email!,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);

    if (error.code === "over_email_send_rate_limit") {
      return NextResponse.json(
        { error: "Wait before requesting another OTP" },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ otpSent: true });
}
