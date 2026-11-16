import { createBrowserClient } from "@supabase/ssr";

// Client browser yang membawa sesi login admin (dari cookie). Dipakai untuk upload gambar
// langsung ke Storage, agar file tidak melewati server Next.js (batas body Vercel 4.5 MB).
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
