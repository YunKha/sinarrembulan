import Link from "next/link";
import type { ReactNode } from "react";
import { Alert } from "./ui";

// Pesan sukses setelah redirect dari server action (?ok=...), pengganti session flash Laravel.
export function Flash({ ok }: { ok?: string }) {
  return ok ? <div className="mb-6"><Alert tone="ok">{ok}</Alert></div> : null;
}

export function PageHead({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex justify-between items-center gap-4 mb-6">
      <h2 className="text-white font-heading font-semibold text-xl">{title}</h2>
      {action && <Link href={action.href} className="btn-primary text-sm px-5! py-2! shrink-0">{action.label}</Link>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card p-6 sm:p-8 ${className}`}>{children}</div>;
}

export function Table({ head, children, empty, colSpan }: { head: ReactNode; children: ReactNode; empty?: boolean; colSpan: number }) {
  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/5 text-left text-gray-400 [&>th]:px-6 [&>th]:py-4 [&>th]:font-medium">{head}</tr></thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-white/5 [&>tr:hover]:bg-white/5 [&_td]:px-6 [&_td]:py-4">
          {empty ? <tr><td colSpan={colSpan} className="text-center text-gray-500 py-8!">Belum ada data.</td></tr> : children}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "red" | "yellow" | "cyan" | "purple" | "gray"; children: ReactNode }) {
  const tones = {
    green: "bg-green-500/10 text-green-400", red: "bg-red-500/10 text-red-400", yellow: "bg-yellow-500/10 text-yellow-400",
    cyan: "bg-cyan-500/10 text-cyan-400", purple: "bg-purple-500/10 text-purple-400", gray: "bg-white/5 text-gray-400",
  };
  return <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

// Tanggal & waktu dalam WIB (server Vercel berjalan di UTC).
export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  for (const [unit, sec] of [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]] as const) {
    if (s >= sec) return rtf.format(-Math.floor(s / sec), unit);
  }
  return "baru saja";
}

export const PER_PAGE = 20;
export const pageRange = (page: number) => [(page - 1) * PER_PAGE, page * PER_PAGE - 1] as const;
