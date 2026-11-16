import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BackLink, Cover, PageSection } from "@/components/cards";
import { P, SectionBadge, Svg } from "@/components/icons";
import { formatDate, getPortfolio, mediaUrl, ucfirst } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => [];
const load = cache(getPortfolio);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  const { portfolio: p } = data;
  const img = mediaUrl(p.thumbnail);
  return {
    title: p.title,
    description: p.short_description,
    openGraph: { title: p.title, description: p.short_description, images: img ? [img] : undefined },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-heading font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default async function PortfolioDetailPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { portfolio: p, images, related } = data;

  return (
    <PageSection width="max-w-5xl">
      <BackLink href="/portfolio" label="Back to Portfolio" />
      <div data-aos="fade-up">
        <div className="mt-4"><SectionBadge>{p.category?.name}</SectionBadge></div>
        <h1 className="section-title mt-2">{p.title}</h1>
        <div className="flex flex-wrap gap-4 mt-4 mb-8">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Svg d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-4 h-4" /> {p.client_name ?? "N/A"}
          </span>
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Svg d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" /> {ucfirst(p.completion_status.replace(/_/g, " "))}
          </span>
          {p.end_date && <span className="text-gray-400 text-sm">{formatDate(p.end_date)}</span>}
          {p.project_url && (
            <a href={p.project_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
              Visit Project <Svg d={P.arrowRight} className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden mb-8" data-aos="fade-up">
        <Cover src={p.thumbnail} alt={p.title} icon={P.image} className="h-64 md:h-96" priority sizes="(min-width: 1024px) 1024px, 100vw" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6" data-aos="fade-right">
          <Block title="Description">
            <div className="text-gray-400 leading-relaxed whitespace-pre-line">{p.description ?? p.short_description}</div>
          </Block>
          {p.challenges && <Block title="Challenges"><p className="text-gray-400 whitespace-pre-line">{p.challenges}</p></Block>}
          {p.solutions && <Block title="Solutions"><p className="text-gray-400 whitespace-pre-line">{p.solutions}</p></Block>}
        </div>
        <div className="space-y-6" data-aos="fade-left">
          {!!p.technologies?.length && (
            <Block title="Technologies">
              <div className="flex flex-wrap gap-2">
                {p.technologies.map((t) => <span key={t} className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">{t}</span>)}
              </div>
            </Block>
          )}
          {!!p.features?.length && (
            <Block title="Features">
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-gray-400 text-sm flex items-start gap-2">
                    <Svg d={P.check} className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </div>

      {/* Galeri (tersimpan di Laravel tapi tidak pernah ditampilkan) */}
      {images.length > 0 && (
        <div className="mt-16" data-aos="fade-up">
          <h2 className="text-white font-heading font-semibold text-xl mb-6">Gallery</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <figure key={img.id} className="glass-card overflow-hidden group">
                <a href={mediaUrl(img.image)!} target="_blank" rel="noopener noreferrer" className="block relative h-48">
                  <Image src={mediaUrl(img.image)!} alt={img.caption ?? p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </a>
                {img.caption && <figcaption className="p-3 text-gray-400 text-sm">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16" data-aos="fade-up">
          <h2 className="text-white font-heading font-semibold text-xl mb-6">Related Projects</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/portfolio/${r.slug}`} className="glass-card p-4 card-hover">
                <h3 className="text-white font-semibold text-sm">{r.title}</h3>
                <p className="text-gray-400 text-xs mt-1">{r.category?.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageSection>
  );
}
