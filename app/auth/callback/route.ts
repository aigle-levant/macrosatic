import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ✅ Proper IP extractor
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
            console.error("Cookie set error:", err);
          }
        },
      },
    },
  );

  try {
    // ✅ Step 1: exchange session
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("No code in callback");
      return NextResponse.redirect("/auth/error");
    }

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Session exchange failed:", exchangeError.message);
      return NextResponse.redirect("/auth/error");
    }

    // ✅ Step 2: get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch failed:", userError?.message);
      return NextResponse.redirect("/auth/error");
    }

    // ✅ Step 3: get IP
    const ip = getClientIP(request);

    console.log("User ID:", user.id);
    console.log("Client IP:", ip);

    // ✅ Step 4: insert trusted IP
    const { error: insertError } = await supabase.from("user_ip").insert({
      user_id: user.id,
      ip_address: ip,
    });

    if (insertError) {
      console.error("IP insert failed:", insertError.message);
      // 🚨 don't block login if this fails
    }

    // ✅ Step 5: redirect
    return NextResponse.redirect("/protected");
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect("/auth/error");
  }
}
