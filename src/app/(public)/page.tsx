import Image from "next/image";
import Link from "next/link";
import { BlogCard, PortfolioCard, ServiceCard } from "@/components/cards";
import { Counter } from "@/components/client";
import { P, SectionBadge, Svg } from "@/components/icons";
import {
  getAbout, getClients, getFeaturedPortfolios, getHero, getLatestBlogs, getServices, getSettings, getTestimonials,
  mediaUrl, truncate,
} from "@/lib/data";

// Posisi partikel tetap (di Blade acak tiap request) agar halaman bisa di-cache dan tidak "loncat".
const PARTICLES = [
  [8, 20, 30, 7], [6, 70, 15, 9], [10, 40, 80, 6], [5, 85, 60, 8], [12, 15, 55, 10], [7, 60, 88, 5],
];

const STATS = [
  ["total_projects", 150, "Total Projects", "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"],
  ["happy_clients", 85, "Happy Clients", "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
  ["years_experience", 7, "Years Experience", "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"],
  ["team_members", 50, "Professional Team", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"],
] as const;

const REASONS = [
  ["Professional Team", "Tim developer berpengalaman dan bersertifikasi internasional", "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"],
  ["Fast Response", "Respons cepat dan komunikasi yang transparan", "M13 10V3L4 14h7v7l9-11h-7z"],
  ["Modern Technology", "Menggunakan teknologi terkini dan best practices", "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"],
  ["Secure System", "Keamanan data dan sistem yang terjamin", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"],
  ["24/7 Support", "Dukungan teknis tersedia setiap saat", "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
  ["Scalable Solution", "Solusi yang dapat berkembang sesuai kebutuhan", "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"],
];

function SectionHead({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16" data-aos="fade-up">
      <div className="section-badge mx-auto"><span className="w-2 h-2 bg-cyan-400 rounded-full" /> {badge}</div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export default async function HomePage() {
  const [hero, about, services, portfolios, clients, testimonials, blogs, setting] = await Promise.all([
    getHero(), getAbout(), getServices(), getFeaturedPortfolios(), getClients(), getTestimonials(), getLatestBlogs(3), getSettings(),
  ]);
  const heroBg = mediaUrl(hero?.background_image);
  const years = Number(setting("years_experience", "7"));

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-svh flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-dark-600" />
        {heroBg && <Image src={heroBg} alt="" fill priority sizes="100vw" className="object-cover opacity-20" />}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {PARTICLES.map(([size, top, left, dur], i) => (
            <div key={i} className="particle"
              style={{ width: size, height: size, top: `${top}%`, left: `${left}%`, "--duration": `${dur}s`, "--delay": `${i * 0.5}s` } as React.CSSProperties} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="animate-hero-in"><SectionBadge pulse>Welcome to SRI</SectionBadge></div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6 text-balance animate-hero-in [animation-delay:100ms]">
                {hero?.headline ?? "Innovative IT Solutions For Smarter Future"}
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl animate-hero-in [animation-delay:200ms]">
                {hero?.subheadline ?? "PT. Sinar Rembulan Inotech menyediakan layanan software development, AI solutions, IT infrastructure, dan digital transformation."}
              </p>
              <div className="flex flex-wrap gap-4 animate-hero-in [animation-delay:300ms]">
                <Link href={hero?.button_link_1 ?? "/services"} className="btn-primary">
                  <Svg d={P.bolt} className="w-5 h-5 mr-2" /> {hero?.button_text_1 ?? "Explore Services"}
                </Link>
                <Link href={hero?.button_link_2 ?? "/portfolio"} className="btn-secondary group">
                  {hero?.button_text_2 ?? "View Portfolio"}
                  <Svg d={P.arrowRight} className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block animate-hero-in [animation-delay:400ms]" aria-hidden="true">
              <div className="relative">
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full animate-pulse-slow blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-card p-8 animate-float">
                    <Svg d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={1} className="w-32 h-32 text-cyan-400 mx-auto" />
                    <p className="text-center text-cyan-400 font-heading font-semibold mt-4">Digital Innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="#stats" aria-label="Scroll ke bawah" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Svg d="M19 14l-7 7m0 0l-7-7m7 7V3" className="w-6 h-6 text-cyan-400" />
        </a>
      </section>

      {/* STATISTIK */}
      <section id="stats" className="relative py-16 -mt-16 z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STATS.map(([key, fallback, label, icon], i) => (
              <div key={key} className="glass-card p-6 text-center card-hover" data-aos="fade-up" style={{ "--i": i } as React.CSSProperties}>
                <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Svg d={icon} className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-3xl lg:text-4xl font-heading font-bold text-white mb-1 tabular-nums">
                  <Counter value={Number(setting(key, String(fallback)))} />+
                </div>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <div className="relative">
                <div className="glass-card p-8 overflow-hidden">
                  {mediaUrl(about?.image) ? (
                    <div className="relative h-64">
                      <Image src={mediaUrl(about?.image)!} alt={about?.title ?? "About"} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover rounded-xl" />
                    </div>
                  ) : (
                    <Svg d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth={0.5} className="w-full h-64 text-cyan-400/20" />
                  )}
                </div>
                <div className="absolute -bottom-4 -right-4 glass-card p-4 animate-float-slow">
                  <p className="text-cyan-400 font-bold text-2xl">{years}+</p>
                  <p className="text-gray-400 text-xs">Years</p>
                </div>
              </div>
            </div>
            <div data-aos="fade-left">
              <SectionBadge>About Us</SectionBadge>
              <h2 className="section-title">{about?.title ?? "PT. Sinar Rembulan Inotech"}</h2>
              <p className="text-gray-400 leading-relaxed mb-6">{truncate(about?.description, 300)}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-4"><p className="text-cyan-400 font-semibold mb-1">Vision</p><p className="text-gray-400 text-sm">{truncate(about?.vision, 80)}</p></div>
                <div className="glass-card p-4"><p className="text-cyan-400 font-semibold mb-1">Mission</p><p className="text-gray-400 text-sm">{truncate(about?.mission, 80)}</p></div>
              </div>
              <Link href="/about" className="btn-primary group">
                Learn More <Svg d={P.arrowRight} className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="section-padding relative bg-dark-500/50">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead badge="Our Services" title="What We Offer" subtitle="Solusi teknologi terbaik untuk kebutuhan bisnis Anda" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((s, i) => <ServiceCard key={s.id} service={s} i={i} />)}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="section-padding relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead badge="Why Choose Us" title="Why Choose SRI?" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map(([title, desc, icon], i) => (
              <div key={title} className="glass-card p-6 card-hover group" data-aos="fade-up" style={{ "--i": i % 3 } as React.CSSProperties}>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all">
                  <Svg d={icon} className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      {portfolios.length > 0 && (
        <section className="section-padding relative bg-dark-500/50">
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead badge="Our Portfolio" title="Featured Projects" subtitle="Beberapa project terbaik yang telah kami kerjakan" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((p, i) => <PortfolioCard key={p.id} portfolio={p} i={i} />)}
            </div>
            <div className="text-center mt-12" data-aos="fade-up">
              <Link href="/portfolio" className="btn-secondary group">
                View All Projects <Svg d={P.arrowRight} className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* KLIEN */}
      {clients.length > 0 && (
        <section className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <div className="section-badge mx-auto"><span className="w-2 h-2 bg-cyan-400 rounded-full" /> Our Clients</div>
              <h2 className="text-2xl font-heading font-bold text-white">Trusted by Leading Companies</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8 items-center" data-aos="fade-up">
              {clients.map((c) => (
                <div key={c.id} className="glass-card px-8 py-4 hover:border-cyan-500/30 transition-all duration-300">
                  {mediaUrl(c.logo) ? (
                    <Image src={mediaUrl(c.logo)!} alt={c.name} width={120} height={40} className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="text-gray-400 font-medium text-sm">{c.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONI */}
      {testimonials.length > 0 && (
        <section className="section-padding relative bg-dark-500/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead badge="Testimonials" title="What Our Clients Say" />
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <figure key={t.id} className="glass-card p-8 card-hover" data-aos="fade-up" style={{ "--i": i % 3 } as React.CSSProperties}>
                  <div className="flex gap-1 mb-4" aria-label={`Rating ${t.rating} dari 5`}>
                    {Array.from({ length: t.rating }, (_, k) => (
                      <svg key={k} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.review}&rdquo;</blockquote>
                  <figcaption className="flex items-center gap-3">
                    {mediaUrl(t.photo) ? (
                      <Image src={mediaUrl(t.photo)!} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{[t.position, t.company].filter(Boolean).join(", ")}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ARTIKEL TERBARU (baru) */}
      {blogs.length > 0 && (
        <section className="section-padding relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead badge="Blog" title="Latest Insights" subtitle="Wawasan teknologi dan kabar terbaru dari tim kami" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b, i) => <BlogCard key={b.id} blog={b} i={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 to-blue-900/30" />
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative max-w-4xl mx-auto px-4 text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 text-balance">Ready to Transform Your Business?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Konsultasikan kebutuhan IT Anda bersama kami dan wujudkan transformasi digital perusahaan Anda.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary text-lg px-10! py-4!">Start Consultation</Link>
            <Link href="/portfolio" className="btn-secondary text-lg px-10! py-4!">View Portfolio</Link>
          </div>
        </div>
      </section>
    </>
  );
}
