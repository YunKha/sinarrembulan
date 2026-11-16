-- Skema database PT. Sinar Rembulan Inotech (port dari migration Laravel).
-- Jalankan sekali di Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- ============ PROFIL & ROLE (pengganti tabel users Laravel) ============
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'user' check (role in ('user','admin','super_admin')),
  avatar text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profil dibuat otomatis saat user dibuat. Role default 'user' (tanpa akses);
-- role admin diberikan lewat panel admin atau SQL, sehingga signup liar tidak jadi admin.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, role)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'name', ''),
          coalesce(new.raw_app_meta_data->>'role', 'user'));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles
                 where id = auth.uid() and is_active and role in ('admin','super_admin'));
$$;

-- ============ KONTEN ============
create table hero_sections (
  id bigint generated always as identity primary key,
  headline text not null,
  subheadline text not null,
  button_text_1 text not null default 'Explore Services',
  button_link_1 text not null default '/services',
  button_text_2 text not null default 'View Portfolio',
  button_link_2 text not null default '/portfolio',
  background_image text,
  is_active boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table abouts (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  vision text,
  mission text,
  history text,
  image text,
  video_url text,
  year_founded int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  icon text not null default 'code',
  short_description text not null,
  description text,
  image text,
  "order" int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolio_categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text,
  "order" int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolios (
  id bigint generated always as identity primary key,
  category_id bigint not null references portfolio_categories on delete cascade,
  title text not null,
  slug text not null unique,
  thumbnail text,
  short_description text not null,
  description text,
  technologies jsonb,
  features jsonb,
  challenges text,
  solutions text,
  client_name text,
  client_logo text,
  project_url text,
  completion_status text not null default 'completed',
  start_date date,
  end_date date,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolio_images (
  id bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios on delete cascade,
  image text not null,
  caption text,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id bigint generated always as identity primary key,
  name text not null,
  logo text,
  website text,
  description text,
  is_partner boolean not null default false,
  is_active boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  position text,
  company text,
  photo text,
  review text not null,
  rating int not null default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table blog_categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table blogs (
  id bigint generated always as identity primary key,
  category_id bigint not null references blog_categories on delete cascade,
  -- Laravel: cascade. Di sini set null agar menghapus admin tidak ikut menghapus artikelnya.
  author_id uuid references profiles on delete set null,
  title text not null,
  slug text not null unique,
  featured_image text,
  excerpt text not null,
  content text not null,
  tags jsonb,
  meta_title text,
  meta_description text,
  views int not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Penambah views yang aman dipanggil pengunjung anonim (tanpa izin update tabel blogs).
create function increment_blog_views(blog_id bigint) returns void
language sql security definer set search_path = public as $$
  update blogs set views = views + 1 where id = blog_id and is_published and published_at <= now();
$$;

create table careers (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  department text,
  location text not null default 'Jakarta',
  type text not null default 'full-time',
  experience_level text not null default 'mid',
  description text not null,
  requirements text,
  responsibilities text,
  benefits text,
  salary_range text,
  deadline date,
  is_active boolean not null default true,
  is_internship boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table career_applications (
  id bigint generated always as identity primary key,
  career_id bigint not null references careers on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  cv_file text not null,
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Batas sama dengan validasi Laravel; dijaga di DB karena form publik menulis langsung lewat anon key.
  check (char_length(name) <= 255 and char_length(email) <= 255 and email like '%_@_%'
     and char_length(phone) <= 20 and char_length(cv_file) <= 255
     and char_length(coalesce(cover_letter, '')) <= 2000
     and char_length(coalesce(linkedin_url, '')) <= 255
     and char_length(coalesce(portfolio_url, '')) <= 255)
);

create table teams (
  id bigint generated always as identity primary key,
  name text not null,
  position text not null,
  photo text,
  bio text,
  email text,
  linkedin text,
  github text,
  twitter text,
  "order" int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  is_replied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(name) <= 255 and char_length(email) <= 255 and email like '%_@_%'
     and char_length(coalesce(phone, '')) <= 20 and char_length(coalesce(company, '')) <= 255
     and char_length(subject) <= 255 and char_length(message) <= 5000)
);

create table website_settings (
  id bigint generated always as identity primary key,
  key text not null unique,
  value text,
  type text not null default 'text',
  "group" text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_links (
  id bigint generated always as identity primary key,
  platform text not null,
  url text not null,
  icon text,
  "order" int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (char_length(email) <= 255 and email like '%_@_%'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ updated_at otomatis ============
create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','hero_sections','abouts','services','portfolio_categories',
    'portfolios','portfolio_images','clients','testimonials','blog_categories','blogs','careers',
    'career_applications','teams','contact_messages','website_settings','social_links',
    'newsletter_subscribers']
  loop
    execute format('create trigger touch before update on %I for each row execute function touch_updated_at()', t);
    execute format('alter table %I enable row level security', t);
    -- Admin boleh semua operasi di semua tabel.
    execute format('create policy admin_all on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- ============ RLS: akses publik ============
-- Baca konten aktif.
create policy public_read on hero_sections        for select using (is_active);
create policy public_read on abouts               for select using (is_active);
create policy public_read on services             for select using (is_active);
create policy public_read on portfolio_categories for select using (is_active);
create policy public_read on portfolios           for select using (is_active);
create policy public_read on portfolio_images     for select using (true);
create policy public_read on clients              for select using (is_active);
create policy public_read on testimonials         for select using (is_active);
create policy public_read on blog_categories      for select using (is_active);
-- Sama dengan scope published() Laravel, plus artikel terjadwal (published_at di masa depan) belum tampil.
create policy public_read on blogs                for select using (is_published and published_at <= now());
create policy public_read on careers              for select using (is_active);
create policy public_read on teams                for select using (is_active);
create policy public_read on website_settings     for select using (true);
create policy public_read on social_links         for select using (is_active);
-- Profil berisi email/HP: hanya pemiliknya (dan admin, lewat admin_all) yang boleh baca.
create policy own_read on profiles for select using (id = auth.uid());
-- Nama penulis blog untuk publik, tanpa kolom sensitif.
create view blog_authors as select id, name from profiles;
grant select on blog_authors to anon, authenticated;

-- Form publik: kirim saja, tidak bisa membaca balik.
create policy public_insert on contact_messages       for insert with check (not is_read and not is_replied);
create policy public_insert on newsletter_subscribers for insert with check (is_active);
create policy public_insert on career_applications    for insert with check (status = 'pending');

-- ============ STORAGE ============
-- 'media' publik (gambar konten), 'cv' privat (CV pelamar).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 2097152, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']),
  ('cv', 'cv', false, 5242880, array['application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

create policy media_admin_write on storage.objects for all
  using (bucket_id = 'media' and is_admin()) with check (bucket_id = 'media' and is_admin());
create policy cv_public_upload on storage.objects for insert
  with check (bucket_id = 'cv');
create policy cv_admin_read on storage.objects for select
  using (bucket_id = 'cv' and is_admin());
