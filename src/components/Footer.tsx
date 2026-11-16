import Link from "next/link";
import { getServices, getSettings, getSocials } from "@/lib/data";
import { NewsletterForm } from "./client";
import { P, SocialIcon, Svg } from "./icons";
import { Logo } from "./Navbar";

const QUICK_LINKS = [
  ["Home", "/"], ["About Us", "/about"], ["Services", "/services"], ["Portfolio", "/portfolio"],
  ["Blog", "/blog"], ["Career", "/career"], ["Contact", "/contact"],
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2 group">
        <Svg d={P.chevronRight} className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /> {children}
      </Link>
    </li>
  );
}

export default async function Footer() {
  const [setting, socials, services] = await Promise.all([getSettings(), getSocials(), getServices()]);
  return (
    <footer className="relative bg-dark-600 border-t border-white/5">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 border-b border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">Subscribe Newsletter</h2>
              <p className="text-gray-400 mt-1">Dapatkan update terbaru langsung di inbox Anda</p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6"><Logo /></div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              PT. Sinar Rembulan Inotech adalah perusahaan IT yang berfokus pada pengembangan solusi digital inovatif untuk bisnis modern.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}
                  className="w-10 h-10 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all duration-300">
                  <SocialIcon name={s.icon ?? s.platform} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(([label, href]) => <FooterLink key={href} href={href}>{label}</FooterLink>)}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              {services.slice(0, 6).map((s) => <FooterLink key={s.id} href={`/services/${s.slug}`}>{s.title}</FooterLink>)}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Contact Info</h3>
            <address className="not-italic space-y-4">
              <p className="flex items-start gap-3">
                <Svg d={P.pin} className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">{setting("company_address", "Jakarta, Indonesia")}</span>
              </p>
              <a href={`mailto:${setting("company_email", "info@sinarrembulan.com")}`} className="flex items-center gap-3 group">
                <Svg d={P.mail} className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-gray-400 text-sm group-hover:text-cyan-400 transition-colors">{setting("company_email", "info@sinarrembulan.com")}</span>
              </a>
              <a href={`tel:${setting("company_phone", "+62 21 1234 5678").replace(/\s/g, "")}`} className="flex items-center gap-3 group">
                <Svg d={P.phone} className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-gray-400 text-sm group-hover:text-cyan-400 transition-colors">{setting("company_phone", "+62 21 1234 5678")}</span>
              </a>
            </address>
          </div>
        </div>

        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} PT. Sinar Rembulan Inotech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
