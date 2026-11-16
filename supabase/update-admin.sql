-- Pembaruan untuk database yang SUDAH menjalankan schema.sql versi lama.
-- Project baru cukup menjalankan schema.sql terbaru (sudah termasuk semua ini).
-- Aman dijalankan berulang kali.

-- 1. Profil: admin hanya membaca. Role/akun diubah dari server setelah cek Super Admin.
drop policy if exists admin_all on profiles;
drop policy if exists admin_read on profiles;
create policy admin_read on profiles for select using (is_admin());

-- 2. Kategori yang masih dipakai tidak bisa dihapus (sebelumnya ikut menghapus semua portfolio/blog-nya).
alter table portfolios drop constraint if exists portfolios_category_id_fkey,
  add constraint portfolios_category_id_fkey foreign key (category_id) references portfolio_categories on delete restrict;
alter table blogs drop constraint if exists blogs_category_id_fkey,
  add constraint blogs_category_id_fkey foreign key (category_id) references blog_categories on delete restrict;

-- 3. Admin boleh menghapus file CV lamaran.
drop policy if exists cv_admin_delete on storage.objects;
create policy cv_admin_delete on storage.objects for delete using (bucket_id = 'cv' and is_admin());

-- 4. Artikel terjadwal (published_at di masa depan) belum tampil di publik.
drop policy if exists public_read on blogs;
create policy public_read on blogs for select using (is_published and published_at <= now());
create or replace function increment_blog_views(blog_id bigint) returns void
language sql security definer set search_path = public as $$
  update blogs set views = views + 1 where id = blog_id and is_published and published_at <= now();
$$;

-- 5. Batas panjang input form publik (dilewati jika sudah ada).
do $$ begin
  alter table contact_messages add constraint contact_messages_len check (
    char_length(name) <= 255 and char_length(email) <= 255 and email like '%_@_%'
    and char_length(coalesce(phone, '')) <= 20 and char_length(coalesce(company, '')) <= 255
    and char_length(subject) <= 255 and char_length(message) <= 5000);
exception when duplicate_object or duplicate_table then null; end $$;

do $$ begin
  alter table career_applications add constraint career_applications_len check (
    char_length(name) <= 255 and char_length(email) <= 255 and email like '%_@_%'
    and char_length(phone) <= 20 and char_length(cv_file) <= 255
    and char_length(coalesce(cover_letter, '')) <= 2000
    and char_length(coalesce(linkedin_url, '')) <= 255
    and char_length(coalesce(portfolio_url, '')) <= 255);
exception when duplicate_object or duplicate_table then null; end $$;

do $$ begin
  alter table newsletter_subscribers add constraint newsletter_email_len
    check (char_length(email) <= 255 and email like '%_@_%');
exception when duplicate_object or duplicate_table then null; end $$;
