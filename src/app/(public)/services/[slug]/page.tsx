import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, PageSection } from "@/components/cards";
import { ServiceIcon } from "@/components/icons";
import { getServices, mediaUrl } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

// Halaman dibuat saat pertama dikunjungi lalu di-cache (ISR).
export const generateStaticParams = async () => [];

async function load(slug: string) {
  const services = await getServices();
  const service = services.find((s) => s.slug === slug);
  return service ? { service, others: services.filter((s) => s.id !== service.id).slice(0, 4) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  const img = mediaUrl(data.service.image);
  return {
    title: data.service.title,
    description: data.service.short_description,
    openGraph: { title: data.service.title, description: data.service.short_description, images: img ? [img] : undefined },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { service, others } = data;
  const img = mediaUrl(service.image);

  return (
    <PageSection width="max-w-4xl">
      <div data-aos="fade-up">
        <BackLink href="/services" label="Back to Services" />
        <div className="flex items-center gap-4 mt-4">
          <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center text-cyan-400">
            <ServiceIcon name={service.icon} />
          </div>
          <h1 className="section-title mb-0!">{service.title}</h1>
        </div>
        <p className="text-gray-400 text-lg my-8">{service.short_description}</p>
        {img && (
          <div className="glass-card overflow-hidden relative h-64 md:h-96 mb-8">
            <Image src={img} alt={service.title} fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          </div>
        )}
        {service.description && (
          <div className="glass-card p-8 mb-8">
            {/* HTML dari admin (sama seperti {!! !!} di Blade). */}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
          </div>
        )}
      </div>

      {others.length > 0 && (
        <div data-aos="fade-up">
          <h2 className="text-white font-heading font-semibold text-xl mb-6">Other Services</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {others.map((o) => (
              <Link key={o.id} href={`/services/${o.slug}`} className="glass-card p-4 card-hover flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0 text-cyan-400">
                  <ServiceIcon name={o.icon} className="w-5 h-5" />
                </div>
                <p className="text-white font-semibold text-sm">{o.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-8 mt-12 text-center bg-gradient-to-r from-cyan-900/20 to-blue-900/20" data-aos="fade-up">
        <h2 className="text-2xl font-heading font-bold text-white mb-3">Tertarik dengan {service.title}?</h2>
        <p className="text-gray-400 mb-6">Diskusikan kebutuhan Anda dengan tim kami, gratis.</p>
        <Link href="/contact" className="btn-primary">Start Consultation</Link>
      </div>
    </PageSection>
  );
}
