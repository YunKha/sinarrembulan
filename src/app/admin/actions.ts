"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminProfile, requireAdmin } from "@/lib/admin";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES, RESOURCES, SETTINGS, slugify, type Field } from "./resources";

export type Result = { error?: string; ok?: string } | undefined;

function pgError(e: { code?: string; message: string }) {
  if (e.code === "23505") return "Sudah ada data dengan slug/nilai unik yang sama. Ganti slug atau judulnya.";
  if (e.code === "23503") return "Data ini masih dipakai data lain (mis. kategori yang masih berisi portfolio/artikel).";
  if (e.code === "23514") return "Ada isian yang melebihi batas atau formatnya salah.";
  if (e.code === "42501") return "Akses ditolak. Pastikan akun Anda masih aktif sebagai admin.";
  return e.message;
}

// Semua halaman publik di-cache (ISR); setelah admin mengubah data, cache dibuang agar langsung tampil.
const refresh = () => revalidatePath("/", "layout");

const ok = (path: string, message: string) => redirect(`${path}?ok=${encodeURIComponent(message)}`);

// Ubah isian form menjadi nilai kolom sesuai tipe field. Mengembalikan pesan error bila tidak valid.
function readFields(fields: Field[], fd: FormData) {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "gallery") continue;
    const raw = fd.get(f.name);
    const s = typeof raw === "string" ? raw.trim() : "";
    if (f.type === "checkbox") { row[f.name] = fd.has(f.name); continue; }
    if (f.required && !s && f.type !== "slug") return { error: `${f.label} wajib diisi.` };
    if (f.max && s.length > f.max) return { error: `${f.label} maksimal ${f.max} karakter.` };
    if (f.type === "number") {
      const n = s === "" ? (f.default ?? null) : Number(s);
      if (n !== null && !Number.isFinite(Number(n))) return { error: `${f.label} harus berupa angka.` };
      row[f.name] = n;
    } else if (f.type === "list") {
      const items = s.split(f.sep ?? ",").map((x) => x.trim()).filter(Boolean);
      row[f.name] = items.length ? items : null;
    } else if ((f.type === "url") && s && !/^https?:\/\//i.test(s)) {
      return { error: `${f.label} harus diawali http:// atau https://` };
    } else {
      row[f.name] = s || null;
    }
  }
  return { row };
}

// ================= CRUD konten (semua resource di resources.ts) =================
export async function saveResource(key: string, id: number | null, fd: FormData): Promise<Result> {
  const res = RESOURCES[key];
  if (!res) return { error: "Jenis konten tidak dikenal." };
  const { supabase, user } = await requireAdmin();

  const parsed = readFields(res.fields, fd);
  if ("error" in parsed) return { error: parsed.error };
  const row = { ...parsed.row, ...res.fixed };

  const slugField = res.fields.find((f) => f.type === "slug");
  if (slugField && !row.slug) row.slug = slugify(String(row.title ?? row.name ?? ""));
  if (slugField && !row.slug) return { error: "Slug tidak bisa dibuat dari judul. Isi slug secara manual." };

  if (res.author && !id) row.author_id = user.id;
  if (res.publishedAt && row.is_published) {
    // Tanggal terbit diisi sekali saat pertama diterbitkan, sama seperti Laravel.
    const current = id ? (await supabase.from(res.table).select("published_at").eq("id", id).single()).data : null;
    if (!current?.published_at) row.published_at = new Date().toISOString();
  }

  const query = id
    ? supabase.from(res.table).update(row).eq("id", id).select("id").single()
    : supabase.from(res.table).insert(row).select("id").single();
  const { data, error } = await query;
  if (error) return { error: pgError(error) };

  if (res.fields.some((f) => f.type === "gallery")) {
    const remove = fd.getAll("gallery_remove").map(Number).filter(Boolean);
    const add = fd.getAll("gallery").map(String).filter(Boolean);
    if (remove.length) await supabase.from("portfolio_images").delete().eq("portfolio_id", data.id).in("id", remove);
    if (add.length) {
      const { count } = await supabase.from("portfolio_images").select("id", { count: "exact", head: true }).eq("portfolio_id", data.id);
      const { error: e } = await supabase.from("portfolio_images")
        .insert(add.map((image, i) => ({ portfolio_id: data.id, image, order: (count ?? 0) + i })));
      if (e) return { error: pgError(e) };
    }
  }

  refresh();
  ok(`/admin/${key}`, `${res.singular} berhasil disimpan!`);
}

export async function deleteResource(key: string, id: number): Promise<Result> {
  const res = RESOURCES[key];
  if (!res || res.singleton) return { error: "Tidak bisa dihapus." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(res.table).delete().eq("id", id);
  if (error) return { error: pgError(error) };
  refresh();
  ok(`/admin/${key}`, `${res.singular} berhasil dihapus!`);
}

// ================= Settings =================
export async function saveSettings(fd: FormData): Promise<Result> {
  const { supabase } = await requireAdmin();
  const fields = SETTINGS.flatMap((g) => g.fields);
  const parsed = readFields(fields, fd);
  if ("error" in parsed) return { error: parsed.error };
  const rows = fields.map((f) => ({ key: f.name, value: parsed.row[f.name] == null ? null : String(parsed.row[f.name]) }));
  const { error } = await supabase.from("website_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: pgError(error) };
  refresh();
  return { ok: "Settings berhasil diupdate!" };
}

// ================= Pesan kontak =================
export async function setMessageReplied(id: number, replied: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_replied: replied, is_read: true }).eq("id", id);
  if (error) return { error: pgError(error) };
  refresh();
}

export async function deleteMessage(id: number): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { error: pgError(error) };
  refresh();
  ok("/admin/messages", "Pesan berhasil dihapus!");
}

// ================= Lamaran kerja =================
export async function setApplicationStatus(id: number, status: string): Promise<Result> {
  if (!APPLICATION_STATUSES.some(([v]) => v === status)) return { error: "Status tidak valid." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("career_applications").update({ status }).eq("id", id);
  if (error) return { error: pgError(error) };
  refresh();
}

export async function deleteApplication(id: number): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("career_applications").select("cv_file").eq("id", id).single();
  const { error } = await supabase.from("career_applications").delete().eq("id", id);
  if (error) return { error: pgError(error) };
  // CV berisi data pribadi pelamar: ikut dihapus dari storage.
  if (data?.cv_file) await supabase.storage.from("cv").remove([data.cv_file]);
  refresh();
  ok("/admin/applications", "Lamaran berhasil dihapus!");
}

// ================= Users (hanya Super Admin) =================
// Akun dikelola lewat service role karena tabel profiles tidak bisa ditulis dari client.
async function requireSuperAdmin() {
  const s = await requireAdmin();
  return s.profile.role === "super_admin" ? s : null;
}

export async function createUser(fd: FormData): Promise<Result> {
  if (!(await requireSuperAdmin())) return { error: "Hanya Super Admin yang bisa menambah user." };
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = String(fd.get("role") ?? "");
  if (!name || !email) return { error: "Nama dan email wajib diisi." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };
  if (role !== "admin" && role !== "super_admin") return { error: "Role tidak valid." };

  const { error } = await createServiceClient().auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name },
    app_metadata: { role }, // dibaca trigger handle_new_user untuk mengisi profiles.role
  });
  if (error) return { error: /already|registered|exists/i.test(error.message) ? "Email sudah terdaftar." : error.message };
  refresh();
  return { ok: "User berhasil ditambahkan!" };
}

export async function deleteUser(id: string): Promise<Result> {
  const s = await requireSuperAdmin();
  if (!s) return { error: "Hanya Super Admin yang bisa menghapus user." };
  if (s.user.id === id) return { error: "Tidak bisa menghapus akun sendiri!" };
  const { error } = await createServiceClient().auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  refresh();
  ok("/admin/users", "User berhasil dihapus!");
}

// ================= Akun sendiri =================
export async function updateAccount(fd: FormData): Promise<Result> {
  const { supabase, user } = await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("password_confirmation") ?? "");
  if (!name) return { error: "Nama wajib diisi." };
  if (password && password.length < 8) return { error: "Password minimal 8 karakter." };
  if (password !== confirm) return { error: "Konfirmasi password tidak sama." };

  const { error } = await createServiceClient().from("profiles").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };
  if (password) {
    const { error: e } = await supabase.auth.updateUser({ password });
    if (e) return { error: e.message };
  }
  refresh();
  return { ok: password ? "Profil dan password berhasil diperbarui!" : "Profil berhasil diperbarui!" };
}

// ================= Login / logout =================
export async function signIn(fd: FormData): Promise<Result> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  });
  if (error || !data.user) return { error: "Email atau password salah." };

  const { data: profile } = await supabase.from("profiles").select("id, name, email, role, is_active").eq("id", data.user.id).maybeSingle();
  if (!isAdminProfile(profile)) {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }
  // Hanya izinkan kembali ke halaman admin (cegah open redirect ke situs lain).
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
