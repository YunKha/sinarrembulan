import type { Metadata } from "next";
import { BlogCard, Empty, FilterBar, PageHeader, PageSection, Pagination } from "@/components/cards";
import { getBlogCategories, getBlogs } from "@/lib/data";

type Props = { searchParams: Promise<{ category?: string; search?: string; page?: string }> };

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel teknologi, tutorial, dan kabar terbaru dari PT. Sinar Rembulan Inotech.",
};

export default async function BlogPage({ searchParams }: Props) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const [{ items, total }, categories] = await Promise.all([
    getBlogs({ category: query.category, search: query.search, page }),
    getBlogCategories(),
  ]);

  return (
    <PageSection>
      <PageHeader badge="Blog" title="Latest Articles" />
      <FilterBar base="/blog" query={query} categories={categories} placeholder="Search articles..." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length ? items.map((b, i) => <BlogCard key={b.id} blog={b} i={i} />) : <Empty>No articles found.</Empty>}
      </div>
      <Pagination base="/blog" query={query} total={total} />
    </PageSection>
  );
}
