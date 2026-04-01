import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { getClientIP } from "@/lib/get-ip";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    // ✅ Verify OTP
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // ✅ Get user after verification
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const ip = await getClientIP();

        // ✅ INSERT trusted IP
        await supabase.from("user_ip").insert({
          user_id: user.id,
          ip_address: ip,
        });
      }

      // ✅ Redirect after storing IP
      redirect("/protected");
    } else {
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  redirect(`/auth/error?error=No token hash or type`);
}
