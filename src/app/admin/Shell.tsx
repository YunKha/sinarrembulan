"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

// Ikon sama dengan sidebar Laravel; item baru memakai ikon yang serupa.
const I = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  box: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  news: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  team: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  cog: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const MENU: { group?: string; items: [href: string, label: string, icon: string][] }[] = [
  { items: [["/admin", "Dashboard", I.home]] },
  { group: "Halaman", items: [["/admin/hero", "Hero Section", I.image], ["/admin/about", "About", I.info], ["/admin/services", "Services", I.code]] },
  { group: "Portfolio", items: [["/admin/portfolios", "Portfolio", I.box], ["/admin/portfolio-categories", "Kategori Portfolio", I.tag], ["/admin/clients", "Clients", I.building], ["/admin/testimonials", "Testimonials", I.chat]] },
  { group: "Blog", items: [["/admin/blogs", "Blog", I.news], ["/admin/blog-categories", "Kategori Blog", I.tag]] },
  { group: "Karier", items: [["/admin/careers", "Career", I.briefcase], ["/admin/applications", "Lamaran", I.doc], ["/admin/team", "Team", I.team]] },
  { group: "Lainnya", items: [["/admin/messages", "Messages", I.mail], ["/admin/social-links", "Social Links", I.link], ["/admin/settings", "Settings", I.cog], ["/admin/users", "Users", I.users], ["/admin/account", "Akun Saya", I.user]] },
];
const ALL = MENU.flatMap((g) => g.items);

const Icon = ({ d, className = "w-5 h-5 shrink-0" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

export default function Shell({ name, children, signOut }: { name: string; children: ReactNode; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true); // sidebar lebar/ciut (desktop)
  const [mobile, setMobile] = useState(false); // laci menu (HP)

  // Ingat pilihan lebar sidebar per browser.
  useEffect(() => { try { setOpen(localStorage.getItem("admin-sidebar") !== "0"); } catch {} }, []);
  const toggle = () => setOpen((o) => { try { localStorage.setItem("admin-sidebar", o ? "0" : "1"); } catch {} return !o; });
  useEffect(() => setMobile(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
  const title = ALL.filter(([h]) => isActive(h)).at(-1)?.[1] ?? "Admin";

  const nav = (wide: boolean) => (
    <nav className="flex-1 py-4 px-3 overflow-y-auto">
      {MENU.map((g, i) => (
        <div key={i} className="mb-3">
          {g.group && wide && <p className="px-3 mb-1 text-[11px] uppercase tracking-wider text-gray-600">{g.group}</p>}
          <div className="space-y-1">
            {g.items.map(([href, label, icon]) => (
              <Link key={href} href={href} title={wide ? undefined : label} aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                  isActive(href) ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white border-transparent"
                }`}>
                <Icon d={icon} />{wide && <span>{label}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  const brand = (wide: boolean) => (
    <div className="p-4 h-16 border-b border-white/5 flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-heading font-bold text-white text-lg shrink-0">S</div>
      {wide && <span className="text-white font-heading font-bold text-sm">SRI Admin</span>}
    </div>
  );

  const logout = (wide: boolean) => (
    <form action={signOut} className="p-3 border-t border-white/5">
      <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all">
        <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />{wide && <span>Logout</span>}
      </button>
    </form>
  );

  return (
    <div className="flex min-h-screen bg-primary-950">
      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex flex-col bg-dark-600 border-r border-white/5 transition-all duration-300 fixed h-full z-30 ${open ? "w-64" : "w-20"}`}>
        {brand(open)}{nav(open)}{logout(open)}
      </aside>

      {/* Laci menu mobile */}
      <div className={`lg:hidden fixed inset-0 z-40 transition ${mobile ? "visible" : "invisible"}`}>
        <div onClick={() => setMobile(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${mobile ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute left-0 top-0 h-full w-72 flex flex-col bg-dark-600 border-r border-white/5 transition-transform duration-300 ${mobile ? "translate-x-0" : "-translate-x-full"}`}>
          {brand(true)}{nav(true)}{logout(true)}
        </aside>
      </div>

      <div className={`flex-1 min-w-0 transition-all duration-300 ${open ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="bg-dark-500/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={toggle} className="hidden lg:block text-gray-400 hover:text-white" aria-label="Ciutkan/lebarkan sidebar">
                <Icon d="M4 6h16M4 12h16M4 18h16" className="w-6 h-6" />
              </button>
              <button onClick={() => setMobile(true)} className="lg:hidden text-gray-400 hover:text-white" aria-label="Buka menu">
                <Icon d="M4 6h16M4 12h16M4 18h16" className="w-6 h-6" />
              </button>
              <h1 className="text-white font-heading font-semibold text-lg truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <a href="/" target="_blank" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                <Icon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" className="w-4 h-4" />
                <span className="hidden sm:inline">View Site</span>
              </a>
              <Link href="/admin/account" className="text-gray-400 hover:text-white text-sm hidden sm:block">{name}</Link>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
