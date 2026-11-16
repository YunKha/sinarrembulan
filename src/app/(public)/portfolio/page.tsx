import type { Metadata } from "next";
import { Empty, FilterBar, PageHeader, PageSection, Pagination, PortfolioCard } from "@/components/cards";
import { getPortfolioCategories, getPortfolios } from "@/lib/data";

type Props = { searchParams: Promise<{ category?: string; search?: string; page?: string }> };

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Project terbaik PT. Sinar Rembulan Inotech: web, mobile, AI, dashboard analytics, networking, dan smart government.",
};

export default async function PortfolioPage({ searchParams }: Props) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const [{ items, total }, categories] = await Promise.all([
    getPortfolios({ category: query.category, search: query.search, page }),
    getPortfolioCategories(),
  ]);

  return (
    <PageSection>
      <PageHeader badge="Portfolio" title="Our Projects" subtitle="Lihat hasil karya terbaik kami" />
      <FilterBar base="/portfolio" query={query} categories={categories} placeholder="Search portfolio..." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length ? items.map((p, i) => <PortfolioCard key={p.id} portfolio={p} i={i} />) : <Empty>No portfolios found.</Empty>}
      </div>
      <Pagination base="/portfolio" query={query} total={total} />
    </PageSection>
  );
}
