import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Profile = { id: string; name: string; email: string; role: "user" | "admin" | "super_admin"; is_active: boolean };

// Satu kali per request walau dipanggil dari layout, halaman, dan action.
const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, name, email, role, is_active").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: profile as Profile | null };
});

export const isAdminProfile = (p: Profile | null | undefined): p is Profile =>
  !!p?.is_active && (p.role === "admin" || p.role === "super_admin");

// Dipanggil di layout admin DAN di setiap server action (action = endpoint publik).
// Data tetap dijaga RLS di database; ini lapisan pertama + pesan yang jelas.
export async function requireAdmin() {
  const s = await getSession();
  if (!s || !isAdminProfile(s.profile)) redirect("/login");
  return { supabase: s.supabase, user: s.user, profile: s.profile };
}

export async function getAdminOrNull() {
  const s = await getSession();
  return s && isAdminProfile(s.profile) ? s.profile : null;
}
