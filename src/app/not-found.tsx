import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative">
        <p className="text-8xl font-heading font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">404</p>
        <h1 className="text-2xl font-heading font-bold text-white mt-4 mb-2">Halaman tidak ditemukan</h1>
        <p className="text-gray-400 mb-8">Halaman yang Anda cari mungkin sudah dipindah atau dihapus.</p>
        <Link href="/" className="btn-primary">Kembali ke Home</Link>
      </div>
    </main>
  );
}
