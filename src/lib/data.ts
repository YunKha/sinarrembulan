import { cache } from "react";
import { supabase } from "./supabase/public";

// ---------- Tipe baris (subset kolom yang dipakai halaman publik) ----------
export type Service = {
  id: number; title: string; slug: string; icon: string;
  short_description: string; description: string | null; image: string | null;
};
export type Category = { id: number; name: string; slug: string };
export type Portfolio = {
  id: number; title: string; slug: string; thumbnail: string | null;
  short_description: string; description: string | null;
  technologies: string[] | null; features: string[] | null;
  challenges: string | null; solutions: string | null;
  client_name: string | null; project_url: string | null; completion_status: string;
  start_date: string | null; end_date: string | null;
  category_id: number; category: Category | null; created_at: string; updated_at: string;
};
export type Blog = {
  id: number; title: string; slug: string; featured_image: string | null; excerpt: string;
  content: string; tags: string[] | null; meta_title: string | null; meta_description: string | null;
  views: number; published_at: string; updated_at: string; author_id: string | null;
  category_id: number; category: Category | null;
};
export type Career = {
  id: number; title: string; slug: string; department: string | null; location: string;
  type: string; experience_level: string; description: string; requirements: string | null;
  responsibilities: string | null; benefits: string | null; salary_range: string | null;
  deadline: string | null; is_internship: boolean; created_at: string; updated_at: string;
};
export type Social = { id: number; platform: string; url: string; icon: string | null };
export type Hero = {
  headline: string; subheadline: string; button_text_1: string; button_link_1: string;
  button_text_2: string; button_link_2: string; background_image: string | null;
};
export type About = {
  title: string; description: string; vision: string | null; mission: string | null; history: string | null;
  image: string | null; video_url: string | null; year_founded: number | null;
};

// Supabase mengembalikan { data, error }; halaman publik lebih baik gagal jelas daripada tampil kosong diam-diam.
function must<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export const PER_PAGE = 9;

// ---------- Pengaturan & data layout ----------
// cache(): satu query per request walau dipanggil dari layout dan halaman sekaligus.
export const getSettings = cache(async () => {
  const rows = must(await supabase.from("website_settings").select("key, value"));
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  return (key: string, fallback = "") => map[key] || fallback;
});

export const getSocials = cache(async () =>
  must(await supabase.from("social_links").select("id, platform, url, icon").eq("is_active", true).order("order")) as Social[],
);

export const getServices = cache(async () =>
  must(await supabase.from("services").select("*").eq("is_active", true).order("order")) as Service[],
);

// ---------- Konten ----------
export async function getHero() {
  return must(await supabase.from("hero_sections").select("*").eq("is_active", true).order("order").limit(1).maybeSingle()) as Hero | null;
}

export const getAbout = cache(async () =>
  must(await supabase.from("abouts").select("*").eq("is_active", true).limit(1).maybeSingle()) as About | null,
);

export async function getTeam() {
  return must(await supabase.from("teams").select("*").eq("is_active", true).order("order"));
}

export async function getClients() {
  return must(await supabase.from("clients").select("*").eq("is_active", true).order("order"));
}

export async function getTestimonials() {
  return must(await supabase.from("testimonials").select("*").eq("is_active", true).order("order"));
}

const PORTFOLIO_SELECT = "*, category:portfolio_categories(id, name, slug)";

export async function getFeaturedPortfolios() {
  return must(
    await supabase.from("portfolios").select(PORTFOLIO_SELECT)
      .eq("is_active", true).eq("is_featured", true).order("order").limit(6),
  ) as Portfolio[];
}

// Teks pencarian dibungkus tanda kutip agar koma/kurung dari user tidak bisa menyisipkan filter PostgREST.
function ilikeAny(columns: string[], search: string) {
  const q = search.replace(/[\\"]/g, "\\$&");
  return columns.map((c) => `${c}.ilike."%${q}%"`).join(",");
}

export async function getPortfolios({ category, search, page }: { category?: string; search?: string; page: number }) {
  let query = supabase
    .from("portfolios")
    .select(category ? "*, category:portfolio_categories!inner(id, name, slug)" : PORTFOLIO_SELECT, { count: "exact" })
    .eq("is_active", true);
  if (category) query = query.eq("category.slug", category);
  if (search) query = query.or(ilikeAny(["title", "short_description", "client_name"], search));
  const res = await query
    .order("order").order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  return { items: must(res) as unknown as Portfolio[], total: res.count ?? 0 };
}

export async function getPortfolioCategories() {
  const rows = must(
    await supabase.from("portfolio_categories").select("id, name, slug, portfolios(count)").eq("is_active", true).order("order"),
  );
  return rows.map((c) => ({ ...c, count: (c.portfolios as unknown as { count: number }[])[0]?.count ?? 0 }));
}

export async function getPortfolio(slug: string) {
  const p = must(
    await supabase.from("portfolios").select(PORTFOLIO_SELECT).eq("slug", slug).eq("is_active", true).maybeSingle(),
  ) as Portfolio | null;
  if (!p) return null;
  const [images, related] = await Promise.all([
    supabase.from("portfolio_images").select("id, image, caption").eq("portfolio_id", p.id).order("order").then(must),
    supabase.from("portfolios").select(PORTFOLIO_SELECT).eq("is_active", true)
      .eq("category_id", p.category_id).neq("id", p.id).order("order").limit(3).then(must),
  ]);
  return { portfolio: p, images, related: related as Portfolio[] };
}

const BLOG_SELECT = "*, category:blog_categories(id, name, slug)";

export async function getLatestBlogs(limit: number) {
  return must(
    await supabase.from("blogs").select(BLOG_SELECT).order("published_at", { ascending: false }).limit(limit),
  ) as Blog[];
}

export async function getBlogs({ category, search, page }: { category?: string; search?: string; page: number }) {
  // RLS sudah membatasi ke artikel terbit; tidak perlu filter is_published di sini.
  let query = supabase
    .from("blogs")
    .select(category ? "*, category:blog_categories!inner(id, name, slug)" : BLOG_SELECT, { count: "exact" });
  if (category) query = query.eq("category.slug", category);
  if (search) query = query.or(ilikeAny(["title", "excerpt"], search));
  const res = await query
    .order("published_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  return { items: must(res) as unknown as Blog[], total: res.count ?? 0 };
}

export async function getBlogCategories() {
  return must(await supabase.from("blog_categories").select("id, name, slug").eq("is_active", true)) as Category[];
}

export async function getBlog(slug: string) {
  const blog = must(await supabase.from("blogs").select(BLOG_SELECT).eq("slug", slug).maybeSingle()) as Blog | null;
  if (!blog) return null;
  const [author, related] = await Promise.all([
    blog.author_id
      ? supabase.from("blog_authors").select("name").eq("id", blog.author_id).maybeSingle().then(must)
      : null,
    supabase.from("blogs").select("id, title, slug, published_at").eq("category_id", blog.category_id)
      .neq("id", blog.id).order("published_at", { ascending: false }).limit(3).then(must),
  ]);
  return { blog, authorName: author?.name || "Admin", related };
}

export async function getCareers() {
  return must(
    await supabase.from("careers").select("*").eq("is_active", true).order("created_at", { ascending: false }),
  ) as Career[];
}

export async function getCareer(slug: string) {
  return must(await supabase.from("careers").select("*").eq("slug", slug).eq("is_active", true).maybeSingle()) as Career | null;
}

// ---------- Helper tampilan ----------
// Path di DB (mis. "portfolios/a.jpg") -> URL publik bucket 'media'. URL penuh dibiarkan apa adanya.
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const ucfirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function truncate(s: string | null | undefined, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trimEnd() + "..." : s;
}
