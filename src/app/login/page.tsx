import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminOrNull } from "@/lib/admin";
import { signIn } from "../admin/actions";
import { ActionForm } from "../admin/ui";

export const metadata: Metadata = { title: { absolute: "Login - SRI Admin" }, robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdminOrNull()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="relative min-h-svh bg-primary-950 flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative w-full max-w-md animate-hero-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center font-heading font-bold text-white text-2xl shadow-lg shadow-cyan-500/20 mb-4">S</div>
          <h1 className="text-white font-heading font-bold text-2xl">SRI Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">PT. Sinar Rembulan Inotech</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-white font-heading font-semibold text-xl mb-6">Sign In</h2>
          <ActionForm action={signIn}>
            <input type="hidden" name="next" value={next ?? ""} />
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-400 text-sm mb-1 block">Email</span>
                <input type="email" name="email" required autoFocus autoComplete="username" placeholder="admin@sinarrembulan.com" className="input" />
              </label>
              <label className="block">
                <span className="text-gray-400 text-sm mb-1 block">Password</span>
                <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••" className="input" />
              </label>
              <button type="submit" className="btn-primary w-full justify-center py-3.5!">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Sign In
              </button>
            </div>
          </ActionForm>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">&copy; {new Date().getFullYear()} PT. Sinar Rembulan Inotech</p>
      </div>
    </main>
  );
}
