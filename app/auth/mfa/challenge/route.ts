import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { factorId } = await req.json();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    challengeId: data.id,
  });
}
