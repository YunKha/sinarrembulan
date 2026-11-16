import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BackLink, PageSection } from "@/components/cards";
import { ViewTracker } from "@/components/client";
import { SectionBadge } from "@/components/icons";
import { formatDate, getBlog, mediaUrl, readingTime } from "@/lib/data";
import { SITE_URL, jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => [];
const load = cache(getBlog);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  const { blog } = data;
  const description = blog.meta_description || blog.excerpt;
  const img = mediaUrl(blog.featured_image);
  return {
    // absolute: judul artikel tanpa akhiran nama perusahaan, sama seperti Blade.
    title: { absolute: blog.meta_title || blog.title },
    description,
    keywords: blog.tags ?? undefined,
    openGraph: {
      type: "article", title: blog.meta_title || blog.title, description,
      publishedTime: blog.published_at, modifiedTime: blog.updated_at, authors: [data.authorName],
      tags: blog.tags ?? undefined, images: img ? [img] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { blog, authorName, related } = data;
  const img = mediaUrl(blog.featured_image);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: img ?? undefined,
    datePublished: blog.published_at,
    dateModified: blog.updated_at,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "PT. Sinar Rembulan Inotech" },
    mainEntityOfPage: `${SITE_URL}/blog/${blog.slug}`,
    keywords: blog.tags?.join(", "),
  };

  return (
    <PageSection width="max-w-4xl">
      <ViewTracker blogId={blog.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleJsonLd)} />
      <BackLink href="/blog" label="Back to Blog" />
      <article>
        <header data-aos="fade-up">
          <div className="mt-4"><SectionBadge>{blog.category?.name}</SectionBadge></div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mt-2 mb-4 text-balance">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-8 text-gray-400 text-sm">
            <span>By {authorName}</span><span>•</span>
            <time dateTime={blog.published_at}>{formatDate(blog.published_at)}</time><span>•</span>
            <span>{readingTime(blog.content)} min read</span><span>•</span>
            <span>{blog.views} views</span>
          </div>
        </header>
        {img && (
          <div className="glass-card overflow-hidden mb-8 relative h-64 md:h-96" data-aos="fade-up">
            <Image src={img} alt={blog.title} fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="glass-card p-6 md:p-8 mb-8">
          {/* HTML dari admin (sama seperti {!! !!} di Blade). */}
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
        {!!blog.tags?.length && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((t) => <span key={t} className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">#{t}</span>)}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <div data-aos="fade-up">
          <h2 className="text-white font-heading font-semibold text-xl mb-6">Related Articles</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="glass-card p-4 card-hover">
                <h3 className="text-white font-semibold text-sm">{r.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{formatDate(r.published_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageSection>
  );
}
