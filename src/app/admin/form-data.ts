import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resource } from "./resources";

// Opsi dropdown kategori + gambar galeri yang dibutuhkan form sebuah resource.
export async function loadFormData(supabase: SupabaseClient, res: Resource, id: number | null) {
  const options: Record<string, [string, string][]> = {};
  await Promise.all(res.fields.filter((f) => f.optionsFrom).map(async (f) => {
    const { data } = await supabase.from(f.optionsFrom!).select("id, name").order("name");
    options[f.name] = (data ?? []).map((c) => [String(c.id), c.name]);
  }));
  const gallery = id && res.fields.some((f) => f.type === "gallery")
    ? (await supabase.from("portfolio_images").select("id, image").eq("portfolio_id", id).order("order")).data ?? []
    : [];
  return { options, gallery };
}
