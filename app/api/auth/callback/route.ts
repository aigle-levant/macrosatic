import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIp } from "next-request-ip";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
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

    // ✅ Step 3: get IP (FIXED)
    const headersList = await headers();
  const ip = getClientIp(headersList);

    console.log("User ID:", user.id);
    console.log("Client IP:", ip);

    // ✅ Step 4: insert trusted IP
    const { error: insertError } = await supabase.from("user_ip").insert({
      user_id: user.id,
      ip_address: ip,
    });

    if (insertError) {
      console.error("IP insert failed:", insertError.message);
    }

    // ✅ Step 5: redirect
    return NextResponse.redirect(new URL("/protected", request.url));
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}
