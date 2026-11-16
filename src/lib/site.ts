export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

// JSON di dalam <script>: escape "<" agar teks dari DB tidak bisa menutup tag script.
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

// Path di DB (mis. "portfolios/a.jpg") -> URL publik bucket 'media'. URL penuh dibiarkan apa adanya.
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
