import { headers } from "next/headers";
import { MainDash } from "./main-dash";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function MainDashServer() {
    const headerList = await headers();

  const country = headerList.get("x-vercel-ip-country") || "India";
  const region = headerList.get("x-vercel-ip-country-region") || "TN";
  const city = headerList.get("x-vercel-ip-city") || "Chennai";

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const name =
    user.user_metadata?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "there";


  return <MainDash country={country} region={region} city={city} name={name}/>;
}
