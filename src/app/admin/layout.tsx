import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "./actions";
import Shell from "./Shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s - SRI Admin" },
  robots: { index: false, follow: false },
};

// Bukan admin aktif -> /login. Halaman admin selalu dirender per request (pakai cookie sesi).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <Shell name={profile.name || profile.email} signOut={signOut}>{children}</Shell>;
}
