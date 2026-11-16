import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BackLink, PageSection } from "@/components/cards";
import { ApplyForm } from "@/components/client";
import { formatDate, getCareer, truncate, ucfirst } from "@/lib/data";
import { jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => [];
const load = cache(getCareer);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load((await params).slug);
  if (!c) return {};
  return { title: `${c.title} - Career`, description: truncate(c.description, 160) };
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  "full-time": "FULL_TIME", "part-time": "PART_TIME", contract: "CONTRACTOR", freelance: "CONTRACTOR", internship: "INTERN",
};

export default async function CareerDetailPage({ params }: Props) {
  const c = await load((await params).slug);
  if (!c) notFound();
  const closed = !!c.deadline && new Date(c.deadline + "T23:59:59") < new Date();

  // Google Jobs: lowongan bisa tampil langsung di hasil pencarian.
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: c.title,
    description: [c.description, c.requirements, c.responsibilities, c.benefits].filter(Boolean).join("\n\n").replace(/\n/g, "<br>"),
    datePosted: c.created_at,
    validThrough: c.deadline ?? undefined,
    employmentType: c.is_internship ? "INTERN" : EMPLOYMENT_TYPE[c.type] ?? "OTHER",
    hiringOrganization: { "@type": "Organization", name: "PT. Sinar Rembulan Inotech" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: c.location, addressCountry: "ID" } },
  };

  const sections = [
    ["Description", c.description], ["Requirements", c.requirements],
    ["Responsibilities", c.responsibilities], ["Benefits", c.benefits],
  ] as const;

  return (
    <PageSection width="max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(jobJsonLd)} />
      <BackLink href="/career" label="Back" />
      <h1 className="section-title mt-4">{c.title}</h1>
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
        <span className="text-cyan-400 text-sm bg-cyan-500/10 px-3 py-1 rounded-full">{c.is_internship ? "Internship" : ucfirst(c.type)}</span>
        <span className="text-gray-400 text-sm">{c.location}</span>
        <span className="text-gray-400 text-sm">{ucfirst(c.experience_level)}</span>
        {c.salary_range && <span className="text-gray-400 text-sm">{c.salary_range}</span>}
        {c.deadline && <span className={`text-sm ${closed ? "text-red-400" : "text-gray-400"}`}>Deadline: {formatDate(c.deadline)}</span>}
      </div>

      {sections.map(([title, body]) => body && (
        <div key={title} className="glass-card p-8 mb-6" data-aos="fade-up">
          <h2 className="text-white font-semibold mb-3">{title}</h2>
          <div className="text-gray-400 whitespace-pre-line">{body}</div>
        </div>
      ))}

      <div id="apply" className="glass-card p-8 mt-8 scroll-mt-24" data-aos="fade-up">
        <h2 className="text-white font-heading font-semibold text-xl mb-6">Apply for this Position</h2>
        {closed ? <p className="text-gray-400">Pendaftaran untuk posisi ini sudah ditutup.</p> : <ApplyForm careerId={c.id} />}
      </div>
    </PageSection>
  );
}
