import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageSection } from "@/components/cards";
import { P, Svg } from "@/components/icons";
import { getCareers, ucfirst } from "@/lib/data";

export const metadata: Metadata = {
  title: "Career",
  description: "Lowongan kerja dan magang di PT. Sinar Rembulan Inotech. Bergabunglah membangun masa depan digital Indonesia.",
};

export default async function CareerPage() {
  const careers = await getCareers();
  const jobs = careers.filter((c) => !c.is_internship);
  const internships = careers.filter((c) => c.is_internship);

  return (
    <PageSection width="max-w-5xl">
      <PageHeader badge="Career" title="Join Our Team" subtitle="Bergabunglah bersama kami membangun masa depan digital Indonesia" />

      {careers.length === 0 && (
        <div className="glass-card p-10 text-center" data-aos="fade-up">
          <p className="text-white font-semibold mb-2">Belum ada lowongan saat ini.</p>
          <p className="text-gray-400 text-sm mb-6">Tetap kirim CV Anda, kami akan menghubungi bila ada posisi yang cocok.</p>
          <Link href="/contact" className="btn-secondary">Hubungi Kami</Link>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <h2 className="text-white font-heading font-semibold text-2xl mb-6" data-aos="fade-up">Open Positions</h2>
          <div className="space-y-4 mb-12">
            {jobs.map((c) => (
              <Link key={c.id} href={`/career/${c.slug}`} className="glass-card p-6 block card-hover group" data-aos="fade-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-heading font-semibold text-lg group-hover:text-cyan-400 transition-colors">{c.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-gray-400 text-sm flex items-center gap-1"><Svg d={P.pin} className="w-4 h-4" /> {c.location}</span>
                      <span className="text-cyan-400 text-sm bg-cyan-500/10 px-2 py-0.5 rounded-sm">{ucfirst(c.type)}</span>
                      <span className="text-gray-400 text-sm">{ucfirst(c.experience_level)}</span>
                      {c.department && <span className="text-gray-500 text-sm">{c.department}</span>}
                    </div>
                  </div>
                  <span className="text-cyan-400 text-sm font-medium inline-flex items-center gap-1">
                    Apply Now <Svg d={P.arrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {internships.length > 0 && (
        <>
          <h2 className="text-white font-heading font-semibold text-2xl mb-6" data-aos="fade-up">Internship</h2>
          <div className="space-y-4">
            {internships.map((c) => (
              <Link key={c.id} href={`/career/${c.slug}`} className="glass-card p-6 block card-hover" data-aos="fade-up">
                <h3 className="text-white font-semibold">{c.title}</h3>
                <span className="text-cyan-400 text-sm">{c.location} • Internship</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </PageSection>
  );
}
