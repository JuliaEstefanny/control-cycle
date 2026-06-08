import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("cycle_shares")
    .update({ status: "aceito" })
    .eq("id", shareId)
    .eq("recipient_email", profile?.email ?? "");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL("/compartilhamentos", _req.url));
}
