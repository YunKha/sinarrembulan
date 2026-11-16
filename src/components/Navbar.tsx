"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  ["/", "Home"], ["/about", "About"], ["/services", "Services"], ["/portfolio", "Portfolio"],
  ["/blog", "Blog"], ["/career", "Career"], ["/contact", "Contact"],
] as const;

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <>
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-heading font-bold text-white text-lg shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
        S
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <span className="text-white font-heading font-bold text-lg">Sinar Rembulan</span>
        <span className="block text-cyan-400 text-xs font-medium -mt-1">INOTECH</span>
      </div>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu mobile setiap pindah halaman.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-primary-900/80 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Sinar Rembulan Inotech - Home">
            <Logo compact />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={`nav-link px-4 ${isActive(href) ? "active" : ""}`}
                aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="hidden lg:inline-flex btn-primary text-sm px-6! py-2.5!">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Consultation
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile: animasi buka/tutup lewat grid-rows (tinggi otomatis tanpa JS ukur). */}
      <div className={`lg:hidden grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 py-6 space-y-2 bg-primary-900/95 backdrop-blur-xl border-t border-white/5">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} tabIndex={open ? 0 : -1}
                className={`block px-4 py-3 rounded-xl hover:text-white hover:bg-white/5 transition-all ${
                  isActive(href) ? "text-cyan-400 bg-cyan-500/10" : "text-gray-300"
                }`}>
                {label}
              </Link>
            ))}
            <div className="pt-4">
              <Link href="/contact" tabIndex={open ? 0 : -1} className="btn-primary w-full justify-center text-sm">Consultation</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
