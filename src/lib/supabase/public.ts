import { createClient } from "@supabase/supabase-js";

// Client anon tanpa sesi: dipakai halaman publik (server, bisa di-cache) dan form publik (browser).
// Aman diekspos: semua akses dibatasi RLS di schema.sql.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);
