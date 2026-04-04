import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIp } from "next-request-ip";
import { headers } from "next/headers";

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

  // ✅ FIXED: correct IP extraction
  const headersList = await headers();
  const ip = getClientIp(headersList) || "unknown";

  console.log("User:", user.id, "IP:", ip);

  // ✅ Check if IP already trusted
  const { data: existingIP, error: checkError } = await supabase
    .from("user_ip")
    .select("id")
    .eq("user_id", user.id)
    .eq("ip_address", ip)
    .maybeSingle();

  if (checkError) {
    console.error("Check error:", checkError.message);
  }

  if (existingIP) {
    return NextResponse.json({ trusted: true });
  }
  const { error: insertError } = await supabase.from("user_ip").insert([
    {
      user_id: user.id,
      ip_address: ip,
    },
  ]);
  if (insertError) {
    console.error("Insert failed:", insertError.message);
  }

  // ❗ THEN send OTP
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email!,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("OTP error:", error);

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
