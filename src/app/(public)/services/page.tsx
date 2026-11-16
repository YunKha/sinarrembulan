import type { Metadata } from "next";
import { PageHeader, PageSection, ServiceCard } from "@/components/cards";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Layanan IT PT. Sinar Rembulan Inotech: software development, mobile app, AI, infrastruktur IT, cloud, cyber security, dan konsultasi.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <PageSection>
      <PageHeader badge="Our Services" title="IT Solutions We Provide" subtitle="Solusi teknologi lengkap untuk kebutuhan bisnis Anda" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => <ServiceCard key={s.id} service={s} i={i} />)}
      </div>
    </PageSection>
  );
}
