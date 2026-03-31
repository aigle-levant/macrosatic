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
          } catch {
            // edge/runtime safe
          }
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

  // ✅ GET CLIENT IP
  const ip = await getClientIP();

  // ✅ CHECK TRUSTED IP
  const { data: existingIP } = await supabase
    .from("user_ip")
    .select("*")
    .eq("user_id", user.id)
    .eq("ip", ip)
    .single();

  if (existingIP) {
    // ✅ trusted → skip OTP
    return NextResponse.json({ trusted: true });
  }

  // ❗ NOT trusted → send OTP
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email!,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
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
