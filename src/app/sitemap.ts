import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// sitemap.xml otomatis: halaman statis + semua layanan, portfolio, artikel, dan lowongan aktif.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, portfolios, blogs, careers] = await Promise.all([
    supabase.from("services").select("slug, updated_at").eq("is_active", true),
    supabase.from("portfolios").select("slug, updated_at").eq("is_active", true),
    supabase.from("blogs").select("slug, updated_at"),
    supabase.from("careers").select("slug, updated_at").eq("is_active", true),
  ]);
  const rows = (base: string, res: { data: { slug: string; updated_at: string }[] | null }) =>
    (res.data ?? []).map((r) => ({ url: `${SITE_URL}/${base}/${r.slug}`, lastModified: r.updated_at }));

  return [
    ...["", "/about", "/services", "/portfolio", "/blog", "/career", "/contact"].map((p) => ({
      url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8,
    })),
    ...rows("services", services), ...rows("portfolio", portfolios), ...rows("blog", blogs), ...rows("career", careers),
  ];
}
