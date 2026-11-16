import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, PageSection } from "@/components/cards";
import { getAbout, getTeam, mediaUrl, truncate } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: "About Us", description: truncate(about?.description, 160) || undefined };
}

export default async function AboutPage() {
  const [about, team] = await Promise.all([getAbout(), getTeam()]);
  const video = about?.video_url ? toEmbed(about.video_url) : null;

  return (
    <PageSection>
      <PageHeader badge="About Us" title={about?.title ?? "PT. Sinar Rembulan Inotech"} />

      <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
        <div data-aos="fade-right">
          <p className="text-gray-300 leading-relaxed text-lg mb-8">{about?.description}</p>
          <div className="glass-card p-6 mb-6">
            <h2 className="text-cyan-400 font-heading font-semibold text-xl mb-3">Vision</h2>
            <p className="text-gray-400">{about?.vision}</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-cyan-400 font-heading font-semibold text-xl mb-3">Mission</h2>
            <div className="text-gray-400 whitespace-pre-line">{about?.mission}</div>
          </div>
        </div>
        <div data-aos="fade-left" className="space-y-6">
          {mediaUrl(about?.image) && (
            <div className="glass-card overflow-hidden relative h-72">
              <Image src={mediaUrl(about?.image)!} alt={about?.title ?? ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className="glass-card p-8">
            <h2 className="text-white font-heading font-semibold text-xl mb-4">Company History</h2>
            <p className="text-gray-400">{about?.history}</p>
            {about?.year_founded && (
              <div className="mt-6 glass-card p-4 bg-cyan-500/5">
                <p className="text-cyan-400 text-sm">Founded in</p>
                <p className="text-white text-3xl font-heading font-bold">{about.year_founded}</p>
              </div>
            )}
          </div>
          {video && (
            <div className="glass-card overflow-hidden aspect-video">
              <iframe src={video} title="Company profile video" loading="lazy" className="w-full h-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
        </div>
      </div>

      {team.length > 0 && (
        <>
          <div className="text-center mb-12" data-aos="fade-up">
            <div className="section-badge mx-auto"><span className="w-2 h-2 bg-cyan-400 rounded-full" /> Our Team</div>
            <h2 className="section-title">Meet The Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <div key={m.id} className="glass-card p-6 text-center card-hover group" data-aos="fade-up" style={{ "--i": i % 4 } as React.CSSProperties}>
                {mediaUrl(m.photo) ? (
                  <Image src={mediaUrl(m.photo)!} alt={m.name} width={96} height={96}
                    className="w-24 h-24 mx-auto mb-4 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-400 transition-all" />
                ) : (
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {m.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-white font-semibold">{m.name}</h3>
                <p className="text-cyan-400 text-sm mb-2">{m.position}</p>
                <p className="text-gray-400 text-sm">{m.bio}</p>
                {(m.linkedin || m.github || m.email) && (
                  <div className="flex justify-center gap-3 mt-4 text-xs">
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400">LinkedIn</a>}
                    {m.github && <a href={m.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400">GitHub</a>}
                    {m.email && <a href={`mailto:${m.email}`} className="text-gray-500 hover:text-cyan-400">Email</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </PageSection>
  );
}

// Link YouTube biasa -> URL embed. Selain YouTube, hanya URL https yang dipakai apa adanya.
function toEmbed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  return url.startsWith("https://") ? url : null;
}
