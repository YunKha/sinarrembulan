import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSettings, getSocials } from "@/lib/data";
import { SITE_URL, jsonLd } from "@/lib/site";

// Halaman publik di-cache dan diperbarui paling lama tiap 5 menit (ISR).
// Panel admin nanti memanggil revalidatePath agar perubahan langsung tampil.
export const revalidate = 300;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [setting, socials] = await Promise.all([getSettings(), getSocials()]);
  const whatsapp = setting("company_whatsapp", "6281234567890").replace(/[^\d]/g, "");

  // Data terstruktur untuk Google (nama, kontak, alamat, media sosial).
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: setting("company_name", "PT. Sinar Rembulan Inotech"),
    url: SITE_URL,
    email: setting("company_email"),
    telephone: setting("company_phone"),
    address: { "@type": "PostalAddress", streetAddress: setting("company_address"), addressCountry: "ID" },
    sameAs: socials.map((s) => s.url),
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] btn-primary">
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />

      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat via WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-110">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(orgJsonLd)} />
    </>
  );
}
