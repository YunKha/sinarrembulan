// Definisi semua konten yang dikelola admin. Satu daftar ini menggerakkan halaman daftar,
// form tambah/edit, dan penyimpanan (actions.ts). Tambah field = tambah satu baris di sini.
// Hanya field yang terdaftar di sini yang ditulis ke database (mencegah mass-assignment).

export type FieldType =
  | "text" | "textarea" | "html" | "number" | "url" | "email" | "date"
  | "select" | "checkbox" | "image" | "list" | "gallery" | "slug";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  options?: [string, string][];
  optionsFrom?: string; // tabel kategori: opsi diambil dari kolom id & name
  sep?: "," | "\n"; // pemisah untuk type "list"
  default?: string | number | boolean;
  help?: string;
  placeholder?: string;
  folder?: string; // folder upload di bucket 'media'
  section?: string; // judul grup yang tampil di atas field ini
};

export type Column = {
  key: string; // boleh path, mis. "category.name" atau "career_applications.0.count"
  label: string;
  kind?: "bool" | "stars";
  on?: string;
  off?: string;
  offTone?: "red" | "yellow";
  star?: string; // tampilkan ★ jika kolom ini true
  hideSm?: boolean;
};

export type Resource = {
  table: string;
  label: string; // judul menu & halaman
  singular: string; // untuk pesan, mis. "Service berhasil disimpan"
  fields: Field[];
  columns?: Column[];
  select?: string;
  orderBy?: [column: string, ascending: boolean];
  singleton?: boolean; // satu baris saja (Hero, About): langsung tampil form
  fixed?: Record<string, unknown>; // nilai yang selalu ditulis
  publicBase?: string; // link "View" ke halaman publik /{publicBase}/{slug}
  author?: boolean; // isi author_id dengan admin yang membuat
  publishedAt?: boolean; // isi published_at saat pertama kali diterbitkan
  extraLink?: { label: string; href: string }; // "{id}" diganti id baris
};

const ACTIVE: Field = { name: "is_active", label: "Active", type: "checkbox", default: true };
const ORDER: Field = { name: "order", label: "Order", type: "number", default: 0, help: "Angka kecil tampil lebih dulu." };
const SLUG: Field = { name: "slug", label: "Slug (URL)", type: "slug", max: 255, help: "Kosongkan untuk dibuat otomatis dari judul. Mengubah slug akan mengubah URL halaman." };
const ACTIVE_COL: Column = { key: "is_active", label: "Status", kind: "bool", on: "Active", off: "Inactive", hideSm: true };

const ICONS: [string, string][] = [
  ["code", "Code"], ["smartphone", "Smartphone"], ["cpu", "CPU / AI"], ["server", "Server"],
  ["cloud", "Cloud"], ["shield", "Shield"], ["users", "Users"], ["tool", "Tool"],
];

export const RESOURCES: Record<string, Resource> = {
  hero: {
    table: "hero_sections", label: "Hero Section", singular: "Hero section", singleton: true, fixed: { is_active: true },
    fields: [
      { name: "headline", label: "Headline", type: "text", required: true, max: 255 },
      { name: "subheadline", label: "Subheadline", type: "textarea", required: true },
      { name: "button_text_1", label: "Button 1 Text", type: "text", required: true, max: 100, default: "Explore Services" },
      { name: "button_link_1", label: "Button 1 Link", type: "text", required: true, max: 255, default: "/services" },
      { name: "button_text_2", label: "Button 2 Text", type: "text", required: true, max: 100, default: "View Portfolio" },
      { name: "button_link_2", label: "Button 2 Link", type: "text", required: true, max: 255, default: "/portfolio" },
      { name: "background_image", label: "Background Image", type: "image", folder: "hero", help: "Opsional. Tampil samar di belakang hero." },
    ],
  },
  about: {
    table: "abouts", label: "About", singular: "About", singleton: true, fixed: { is_active: true },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 255 },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "vision", label: "Vision", type: "textarea" },
      { name: "mission", label: "Mission", type: "textarea", help: "Satu poin per baris." },
      { name: "history", label: "History", type: "textarea" },
      { name: "year_founded", label: "Year Founded", type: "number" },
      { name: "video_url", label: "Video URL", type: "url", placeholder: "https://youtube.com/watch?v=...", help: "Opsional. Link YouTube profil perusahaan." },
      { name: "image", label: "Image", type: "image", folder: "about" },
    ],
  },
  services: {
    table: "services", label: "Services", singular: "Service", publicBase: "services", orderBy: ["order", true],
    columns: [{ key: "title", label: "Title", star: "is_featured" }, { key: "icon", label: "Icon", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 255 },
      SLUG,
      { name: "icon", label: "Icon", type: "select", required: true, options: ICONS, default: "code" },
      ORDER,
      { name: "short_description", label: "Short Description", type: "textarea", required: true, max: 500 },
      { name: "description", label: "Full Description", type: "html" },
      { name: "image", label: "Image", type: "image", folder: "services" },
      { name: "is_featured", label: "Featured", type: "checkbox" },
      ACTIVE,
    ],
  },
  portfolios: {
    table: "portfolios", label: "Portfolio", singular: "Portfolio", publicBase: "portfolio", orderBy: ["created_at", false],
    select: "*, category:portfolio_categories(name)",
    columns: [{ key: "title", label: "Title", star: "is_featured" }, { key: "category.name", label: "Category", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 255 },
      SLUG,
      { name: "category_id", label: "Category", type: "select", required: true, optionsFrom: "portfolio_categories" },
      { name: "completion_status", label: "Status", type: "select", required: true, default: "completed",
        options: [["completed", "Completed"], ["in_progress", "In Progress"], ["maintenance", "Maintenance"]] },
      { name: "short_description", label: "Short Description", type: "textarea", required: true, max: 500 },
      { name: "description", label: "Full Description", type: "textarea" },
      { name: "technologies", label: "Technologies (pisahkan dengan koma)", type: "list", sep: ",", placeholder: "Laravel, Vue.js, MySQL" },
      { name: "features", label: "Features (satu per baris)", type: "list", sep: "\n" },
      { name: "challenges", label: "Challenges", type: "textarea" },
      { name: "solutions", label: "Solutions", type: "textarea" },
      { name: "client_name", label: "Client Name", type: "text", max: 255 },
      { name: "project_url", label: "Project URL", type: "url", max: 255 },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      ORDER,
      { name: "thumbnail", label: "Thumbnail", type: "image", folder: "portfolios" },
      { name: "gallery", label: "Gallery Images", type: "gallery", folder: "portfolio-gallery" },
      { name: "is_featured", label: "Featured (tampil di Home)", type: "checkbox" },
      ACTIVE,
    ],
  },
  "portfolio-categories": {
    table: "portfolio_categories", label: "Portfolio Categories", singular: "Kategori", orderBy: ["order", true],
    columns: [{ key: "name", label: "Name" }, { key: "slug", label: "Slug", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 255 },
      { ...SLUG, help: "Kosongkan untuk dibuat otomatis dari nama. Dipakai di filter ?category=." },
      { name: "description", label: "Description", type: "textarea" },
      ORDER,
      ACTIVE,
    ],
  },
  blogs: {
    table: "blogs", label: "Blog", singular: "Artikel", publicBase: "blog", orderBy: ["created_at", false],
    author: true, publishedAt: true,
    select: "*, category:blog_categories(name)",
    columns: [
      { key: "title", label: "Title", star: "is_featured" },
      { key: "category.name", label: "Category", hideSm: true },
      { key: "is_published", label: "Status", kind: "bool", on: "Published", off: "Draft", offTone: "yellow", hideSm: true },
      { key: "views", label: "Views", hideSm: true },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 255 },
      SLUG,
      { name: "category_id", label: "Category", type: "select", required: true, optionsFrom: "blog_categories" },
      { name: "tags", label: "Tags (pisahkan dengan koma)", type: "list", sep: ",", placeholder: "technology, innovation" },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, max: 500, help: "Ringkasan singkat di kartu artikel." },
      { name: "content", label: "Content", type: "html", required: true },
      { name: "featured_image", label: "Featured Image", type: "image", folder: "blogs" },
      { name: "meta_title", label: "Meta Title (SEO)", type: "text", max: 255, help: "Opsional. Judul di hasil Google; default = Title." },
      { name: "meta_description", label: "Meta Description (SEO)", type: "textarea", max: 255, help: "Opsional. Deskripsi di hasil Google; default = Excerpt." },
      { name: "is_published", label: "Published", type: "checkbox" },
      { name: "is_featured", label: "Featured", type: "checkbox" },
    ],
  },
  "blog-categories": {
    table: "blog_categories", label: "Blog Categories", singular: "Kategori", orderBy: ["name", true],
    columns: [{ key: "name", label: "Name" }, { key: "slug", label: "Slug", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 255 },
      { ...SLUG, help: "Kosongkan untuk dibuat otomatis dari nama." },
      { name: "description", label: "Description", type: "textarea" },
      ACTIVE,
    ],
  },
  clients: {
    table: "clients", label: "Clients", singular: "Client", orderBy: ["order", true],
    columns: [
      { key: "name", label: "Name" }, { key: "website", label: "Website", hideSm: true },
      { key: "is_partner", label: "Partner", kind: "bool", on: "Partner", off: "-", hideSm: true }, ACTIVE_COL,
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 255 },
      { name: "website", label: "Website", type: "url", max: 255 },
      { name: "description", label: "Description", type: "textarea" },
      ORDER,
      { name: "logo", label: "Logo", type: "image", folder: "clients", help: "Jika kosong, nama klien yang ditampilkan." },
      { name: "is_partner", label: "Partner", type: "checkbox" },
      ACTIVE,
    ],
  },
  testimonials: {
    table: "testimonials", label: "Testimonials", singular: "Testimonial", orderBy: ["order", true],
    columns: [{ key: "name", label: "Name" }, { key: "company", label: "Company", hideSm: true }, { key: "rating", label: "Rating", kind: "stars", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 255 },
      { name: "position", label: "Position", type: "text", max: 255 },
      { name: "company", label: "Company", type: "text", max: 255 },
      { name: "rating", label: "Rating", type: "select", required: true, default: "5",
        options: [["5", "5 Stars"], ["4", "4 Stars"], ["3", "3 Stars"], ["2", "2 Stars"], ["1", "1 Star"]] },
      { name: "review", label: "Review", type: "textarea", required: true },
      ORDER,
      { name: "photo", label: "Photo", type: "image", folder: "testimonials" },
      ACTIVE,
    ],
  },
  team: {
    table: "teams", label: "Team", singular: "Team member", orderBy: ["order", true],
    columns: [{ key: "name", label: "Name" }, { key: "position", label: "Position", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 255 },
      { name: "position", label: "Position", type: "text", required: true, max: 255 },
      { name: "email", label: "Email", type: "email", max: 255 },
      { name: "linkedin", label: "LinkedIn URL", type: "url", max: 255 },
      { name: "github", label: "GitHub URL", type: "url", max: 255 },
      { name: "twitter", label: "Twitter URL", type: "url", max: 255 },
      { name: "bio", label: "Bio", type: "textarea" },
      ORDER,
      { name: "photo", label: "Photo", type: "image", folder: "team" },
      ACTIVE,
    ],
  },
  careers: {
    table: "careers", label: "Career", singular: "Lowongan", publicBase: "career", orderBy: ["created_at", false],
    select: "*, career_applications(count)",
    extraLink: { label: "Lamaran", href: "/admin/applications?career={id}" },
    columns: [
      { key: "title", label: "Title" }, { key: "type", label: "Type", hideSm: true },
      { key: "career_applications.0.count", label: "Applications", hideSm: true }, ACTIVE_COL,
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 255 },
      SLUG,
      { name: "department", label: "Department", type: "text", max: 255 },
      { name: "location", label: "Location", type: "text", required: true, max: 255, default: "Jakarta" },
      { name: "type", label: "Type", type: "select", required: true, default: "full-time",
        options: [["full-time", "Full-time"], ["part-time", "Part-time"], ["contract", "Contract"], ["internship", "Internship"]] },
      { name: "experience_level", label: "Experience", type: "select", required: true, default: "mid",
        options: [["junior", "Junior"], ["mid", "Mid"], ["senior", "Senior"], ["lead", "Lead"]] },
      { name: "salary_range", label: "Salary Range", type: "text", max: 255 },
      { name: "deadline", label: "Deadline", type: "date", help: "Setelah tanggal ini form lamaran ditutup." },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "requirements", label: "Requirements", type: "textarea" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea" },
      { name: "benefits", label: "Benefits", type: "textarea" },
      { name: "is_internship", label: "Internship", type: "checkbox" },
      ACTIVE,
    ],
  },
  "social-links": {
    table: "social_links", label: "Social Links", singular: "Social link", orderBy: ["order", true],
    columns: [{ key: "platform", label: "Platform" }, { key: "url", label: "URL", hideSm: true }, ACTIVE_COL],
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true, max: 255, placeholder: "LinkedIn" },
      { name: "url", label: "URL", type: "url", required: true, max: 255 },
      { name: "icon", label: "Icon", type: "select", default: "linkedin",
        options: [["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["twitter", "Twitter / X"], ["youtube", "YouTube"]] },
      ORDER,
      ACTIVE,
    ],
  },
};

// Pengaturan website (tabel key-value website_settings).
export const SETTINGS: { title: string; fields: Field[] }[] = [
  {
    title: "Company Information",
    fields: [
      { name: "company_name", label: "Company Name", type: "text", max: 255, section: "Company Information" },
      { name: "company_email", label: "Email", type: "email", max: 255 },
      { name: "company_phone", label: "Phone", type: "text", max: 50 },
      { name: "company_whatsapp", label: "WhatsApp", type: "text", max: 50, help: "Nomor untuk tombol WhatsApp, mis. +6281234567890." },
      { name: "company_address", label: "Address", type: "textarea", max: 500 },
      { name: "google_maps_embed", label: "Google Maps Embed URL", type: "url", max: 2000,
        help: "Google Maps > Share > Embed a map > salin isi src=\"...\" (harus diawali https://www.google.com/maps/embed)." },
    ],
  },
  {
    title: "Statistics",
    fields: [
      { name: "total_projects", label: "Total Projects", type: "number", section: "Statistics (angka di Home)" },
      { name: "happy_clients", label: "Happy Clients", type: "number" },
      { name: "years_experience", label: "Years Experience", type: "number" },
      { name: "team_members", label: "Team Members", type: "number" },
    ],
  },
];

export const APPLICATION_STATUSES: [string, string][] = [
  ["pending", "Pending"], ["reviewed", "Reviewed"], ["interview", "Interview"], ["accepted", "Accepted"], ["rejected", "Rejected"],
];

export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
