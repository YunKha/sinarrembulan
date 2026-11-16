import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { ucfirst } from "@/lib/data";
import { timeAgo } from "./parts";

export const metadata: Metadata = { title: "Dashboard" };

const CARDS = [
  ["portfolios", "Portfolios", "/admin/portfolios", "text-cyan-400 bg-cyan-500/10", "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"],
  ["blogs", "Blog Posts", "/admin/blogs", "text-blue-400 bg-blue-500/10", "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"],
  ["clients", "Clients", "/admin/clients", "text-purple-400 bg-purple-500/10", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"],
  ["contact_messages", "Messages", "/admin/messages", "text-green-400 bg-green-500/10", "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"],
] as const;

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const count = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [totals, unread, pendingApps, messages, portfolios, applications] = await Promise.all([
    Promise.all(CARDS.map(([t]) => count(t).then((r) => r.count ?? 0))),
    count("contact_messages").eq("is_read", false).then((r) => r.count ?? 0),
    count("career_applications").eq("status", "pending").then((r) => r.count ?? 0),
    supabase.from("contact_messages").select("id, name, subject, is_read, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("portfolios").select("id, title, completion_status, category:portfolio_categories(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("career_applications").select("id, name, status, created_at, career:careers(title)").order("created_at", { ascending: false }).limit(5),
  ]);

  const sub: Record<string, string> = {
    contact_messages: unread ? `${unread} belum dibaca` : "",
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map(([table, label, href, tone, icon], i) => (
          <Link key={table} href={href} className="glass-card p-6 hover:border-cyan-500/30 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tone}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
            </div>
            <p className="text-3xl font-heading font-bold text-white">{totals[i]}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
            {sub[table] && <p className="text-cyan-400 text-xs mt-1">{sub[table]}</p>}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Recent Messages" href="/admin/messages" empty={!messages.data?.length}>
          {messages.data?.map((m) => (
            <Link key={m.id} href={`/admin/messages/${m.id}`} className="block p-3 rounded-xl hover:bg-white/5 transition-all">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white text-sm font-medium flex items-center gap-2 min-w-0">
                  {!m.is_read && <span className="w-2 h-2 bg-cyan-400 rounded-full shrink-0" aria-label="Belum dibaca" />}
                  <span className="truncate">{m.name}</span>
                </p>
                <span className="text-gray-500 text-xs shrink-0">{timeAgo(m.created_at)}</span>
              </div>
              <p className="text-gray-400 text-xs mt-1 truncate">{m.subject}</p>
            </Link>
          ))}
        </Panel>

        <Panel title="Recent Projects" href="/admin/portfolios" empty={!portfolios.data?.length}>
          {portfolios.data?.map((p) => (
            <Link key={p.id} href={`/admin/portfolios/${p.id}`} className="block p-3 rounded-xl hover:bg-white/5 transition-all">
              <p className="text-white text-sm font-medium">{p.title}</p>
              <p className="text-gray-400 text-xs mt-1">
                {(p.category as unknown as { name: string } | null)?.name ?? ""} • {ucfirst(p.completion_status.replace(/_/g, " "))}
              </p>
            </Link>
          ))}
        </Panel>

        <Panel title={`Lamaran Terbaru${pendingApps ? ` (${pendingApps} pending)` : ""}`} href="/admin/applications" empty={!applications.data?.length}>
          {applications.data?.map((a) => (
            <Link key={a.id} href="/admin/applications" className="block p-3 rounded-xl hover:bg-white/5 transition-all">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white text-sm font-medium truncate">{a.name}</p>
                <span className="text-gray-500 text-xs shrink-0">{timeAgo(a.created_at)}</span>
              </div>
              <p className="text-gray-400 text-xs mt-1 truncate">{(a.career as unknown as { title: string } | null)?.title} • {ucfirst(a.status)}</p>
            </Link>
          ))}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, href, empty, children }: { title: string; href: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-heading font-semibold text-lg">{title}</h3>
        <Link href={href} className="text-cyan-400 text-xs hover:text-cyan-300">Lihat semua</Link>
      </div>
      <div className="space-y-1">{empty ? <p className="text-gray-500 text-sm">Belum ada data.</p> : children}</div>
    </div>
  );
}
