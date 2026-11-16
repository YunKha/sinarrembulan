import Image from "next/image";
import Link from "next/link";
import Form from "next/form";
import type { ReactNode } from "react";
import { type Blog, type Portfolio, type Service, PER_PAGE, formatDate, mediaUrl, readingTime } from "@/lib/data";
import { P, ServiceIcon, Svg } from "./icons";

const delay = (i: number) => ({ "--i": i % 4 }) as React.CSSProperties;

export function ServiceCard({ service, i }: { service: Service; i: number }) {
  return (
    <div className="glass-card p-6 card-hover group" data-aos="fade-up" style={delay(i)}>
      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-5 text-cyan-400 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 group-hover:scale-110 transition-all duration-500">
        <ServiceIcon name={service.icon} />
      </div>
      <h3 className="text-white font-heading font-semibold text-lg mb-2">{service.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{service.short_description}</p>
      <Link href={`/services/${service.slug}`} className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors inline-flex items-center gap-1 group/link">
        Read More <span className="sr-only">tentang {service.title}</span>
        <Svg d={P.arrowRight} className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// Gambar sampul dengan placeholder ikon bila kosong (sama seperti Blade), tapi dioptimasi next/image.
export function Cover({ src, alt, icon, className = "h-48", priority, sizes }: {
  src: string | null; alt: string; icon: string; className?: string; priority?: boolean; sizes?: string;
}) {
  const url = mediaUrl(src);
  return (
    <div className={`relative ${className} bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center overflow-hidden`}>
      {url ? (
        <Image src={url} alt={alt} fill priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <Svg d={icon} strokeWidth={1} className="w-16 h-16 text-cyan-400/30 group-hover:text-cyan-400/50 transition-colors" />
      )}
    </div>
  );
}

export function PortfolioCard({ portfolio, i }: { portfolio: Portfolio; i: number }) {
  return (
    <Link href={`/portfolio/${portfolio.slug}`} className="glass-card overflow-hidden card-hover group" data-aos="fade-up" style={delay(i)}>
      <Cover src={portfolio.thumbnail} alt={portfolio.title} icon={P.image} />
      <div className="p-6">
        <span className="text-cyan-400 text-xs font-medium bg-cyan-500/10 px-3 py-1 rounded-full">{portfolio.category?.name ?? "Project"}</span>
        <h3 className="text-white font-heading font-semibold mt-3 mb-2 group-hover:text-cyan-400 transition-colors">{portfolio.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{portfolio.short_description}</p>
        {!!portfolio.technologies?.length && (
          <div className="flex flex-wrap gap-1 mt-3">
            {portfolio.technologies.slice(0, 3).map((t) => (
              <span key={t} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-sm">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

const NEWSPAPER = "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z";

export function BlogCard({ blog, i }: { blog: Blog; i: number }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="glass-card overflow-hidden card-hover group" data-aos="fade-up" style={delay(i)}>
      <Cover src={blog.featured_image} alt={blog.title} icon={NEWSPAPER} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-cyan-400 text-xs bg-cyan-500/10 px-2 py-0.5 rounded-sm">{blog.category?.name}</span>
          <time dateTime={blog.published_at} className="text-gray-500 text-xs">{formatDate(blog.published_at)}</time>
        </div>
        <h3 className="text-white font-heading font-semibold mb-2 group-hover:text-cyan-400 transition-colors">{blog.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
        <div className="flex items-center gap-2 mt-4 text-gray-500 text-xs">
          <span>{readingTime(blog.content)} min read</span><span>•</span><span>{blog.views} views</span>
        </div>
      </div>
    </Link>
  );
}

// ---------- Header halaman dalam (about, services, ...) ----------
export function PageHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12 lg:mb-16" data-aos="fade-up">
      <div className="section-badge mx-auto"><span className="w-2 h-2 bg-cyan-400 rounded-full" /> {badge}</div>
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export function PageSection({ children, width = "max-w-7xl" }: { children: ReactNode; width?: string }) {
  return (
    <section className="pt-32 pb-20 relative">
      <div className="absolute inset-0 bg-mesh opacity-20" />
      <div className={`relative ${width} mx-auto px-4 sm:px-6 lg:px-8`}>{children}</div>
    </section>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-cyan-400 text-sm hover:text-cyan-300 mb-4 inline-flex items-center gap-1 group">
      <Svg d={P.chevronLeft} className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {label}
    </Link>
  );
}

// ---------- Filter kategori + pencarian (portfolio & blog) ----------
type Query = { [param: string]: string | undefined; category?: string; search?: string; page?: string };

function href(base: string, q: Query) {
  const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
  const s = params.toString();
  return s ? `${base}?${s}` : base;
}

export function FilterBar({ base, query, categories, placeholder }: {
  base: string; query: Query; categories: { slug: string; name: string; count?: number }[]; placeholder: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center justify-between" data-aos="fade-up">
      <div className="flex flex-wrap gap-2">
        <Link href={href(base, { search: query.search })} scroll={false}
          className={`chip ${!query.category ? "chip-on" : "chip-off"}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={href(base, { category: c.slug, search: query.search })} scroll={false}
            className={`chip ${query.category === c.slug ? "chip-on" : "chip-off"}`}>
            {c.name}{c.count !== undefined && ` (${c.count})`}
          </Link>
        ))}
      </div>
      {/* next/form: GET form biasa yang berpindah halaman tanpa reload penuh. */}
      <Form action={base} scroll={false} className="w-full lg:w-auto" role="search">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        <input type="search" name="search" defaultValue={query.search} placeholder={placeholder} aria-label={placeholder}
          className="w-full lg:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
      </Form>
    </div>
  );
}

export function Pagination({ base, query, total, perPage = PER_PAGE }: { base: string; query: Query; total: number; perPage?: number }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const current = Math.min(Math.max(1, Number(query.page) || 1), pages);
  const link = (p: number) => href(base, { ...query, page: p > 1 ? String(p) : undefined });
  const cls = "min-w-10 h-10 px-3 rounded-xl text-sm font-medium flex items-center justify-center transition-all";
  return (
    <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
      {current > 1 && <Link href={link(current - 1)} className={`${cls} chip-off`} aria-label="Halaman sebelumnya">‹</Link>}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={link(p)} aria-current={p === current ? "page" : undefined}
          className={`${cls} ${p === current ? "chip-on" : "chip-off"}`}>{p}</Link>
      ))}
      {current < pages && <Link href={link(current + 1)} className={`${cls} chip-off`} aria-label="Halaman berikutnya">›</Link>}
    </nav>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="col-span-full text-center py-20"><p className="text-gray-500">{children}</p></div>;
}
