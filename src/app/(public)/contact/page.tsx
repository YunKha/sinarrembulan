import type { Metadata } from "next";
import { PageHeader, PageSection } from "@/components/cards";
import { ContactForm } from "@/components/client";
import { P, SocialIcon, Svg } from "@/components/icons";
import { getSettings, getSocials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi PT. Sinar Rembulan Inotech untuk konsultasi dan kebutuhan IT Anda.",
};

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Svg d={icon} className="w-6 h-6 text-cyan-400" />
        </div>
        <div><h2 className="text-white font-semibold mb-1">{title}</h2><div className="text-gray-400 text-sm">{children}</div></div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const [setting, socials] = await Promise.all([getSettings(), getSocials()]);
  const email = setting("company_email");
  const phone = setting("company_phone");
  const map = setting("google_maps_embed");

  return (
    <PageSection>
      <PageHeader badge="Contact Us" title="Get In Touch" subtitle="Hubungi kami untuk konsultasi dan kebutuhan IT Anda" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6" data-aos="fade-right">
          <InfoCard icon={P.pin} title="Office Address">{setting("company_address")}</InfoCard>
          <InfoCard icon={P.mail} title="Email"><a href={`mailto:${email}`} className="hover:text-cyan-400 transition-colors">{email}</a></InfoCard>
          <InfoCard icon={P.phone} title="Phone"><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-cyan-400 transition-colors">{phone}</a></InfoCard>
          {socials.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-3">Follow Us</h2>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}
                    className="w-10 h-10 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all">
                    <SocialIcon name={s.icon ?? s.platform} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2" data-aos="fade-left">
          <div className="glass-card p-8">
            <h2 className="text-white font-heading font-semibold text-xl mb-6">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Peta (setting google_maps_embed ada di Laravel tapi tidak pernah ditampilkan) */}
      {map.startsWith("https://www.google.com/maps/embed") && (
        <div className="glass-card overflow-hidden mt-8 h-80" data-aos="fade-up">
          <iframe src={map} title="Lokasi kantor" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0 grayscale-[60%] invert-[90%] hue-rotate-180" />
        </div>
      )}
    </PageSection>
  );
}
