import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("MFA enroll response:", data);

    return NextResponse.json({
      factorId: data.id,
      qr: data.totp.qr_code,
    });
  } catch (err) {
    console.error("MFA ENROLL ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}