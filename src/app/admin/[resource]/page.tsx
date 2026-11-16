import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/cards";
import { requireAdmin } from "@/lib/admin";
import { deleteResource, saveResource } from "../actions";
import { loadFormData } from "../form-data";
import { Badge, Card, Flash, PageHead, PER_PAGE, Table, pageRange } from "../parts";
import { RESOURCES, type Column } from "../resources";
import { ActionButton, ResourceForm } from "../ui";

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<{ ok?: string; page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: RESOURCES[(await params).resource]?.label };
}

type Row = Record<string, unknown> & { id: number };

const get = (row: unknown, path: string) =>
  path.split(".").reduce<unknown>((v, k) => (v == null ? v : (v as Record<string, unknown>)[k]), row);

function Cell({ row, col }: { row: Row; col: Column }) {
  const v = get(row, col.key);
  if (col.kind === "bool") {
    if (!v && col.off === "-") return <span className="text-gray-600">-</span>;
    return <Badge tone={v ? (col.on === "Partner" ? "cyan" : "green") : col.offTone ?? "red"}>{v ? col.on : col.off}</Badge>;
  }
  if (col.kind === "stars") return <span className="text-yellow-400 tracking-tight">{"★".repeat(Number(v) || 0)}</span>;
  return (
    <>
      {v == null || v === "" ? "-" : String(v)}
      {col.star && row[col.star] ? <span className="ml-2 text-xs text-yellow-400" title="Featured">★</span> : null}
    </>
  );
}

export default async function ResourcePage({ params, searchParams }: Props) {
  const { resource: key } = await params;
  const res = RESOURCES[key];
  if (!res) notFound();
  const { supabase } = await requireAdmin();
  const query = await searchParams;

  // Hero & About: satu baris saja, langsung tampil form edit (seperti Laravel).
  if (res.singleton) {
    const { data: row } = await supabase.from(res.table).select("*").order("id").limit(1).maybeSingle();
    const { options } = await loadFormData(supabase, res, null);
    return (
      <div className="max-w-3xl">
        <Flash ok={query.ok} />
        <Card>
          <ResourceForm fields={res.fields} values={row ?? {}} options={options} action={saveResource.bind(null, key, row?.id ?? null)} />
        </Card>
      </div>
    );
  }

  const page = Math.max(1, Number(query.page) || 1);
  const [orderCol, asc] = res.orderBy ?? ["created_at", false];
  const { data, count, error } = await supabase.from(res.table).select(res.select ?? "*", { count: "exact" })
    .order(orderCol, { ascending: asc }).order("id", { ascending: false }).range(...pageRange(page));
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Row[];
  const cols = res.columns ?? [];

  return (
    <>
      <Flash ok={query.ok} />
      <PageHead title={res.label} action={{ href: `/admin/${key}/new`, label: `+ Add ${res.singular}` }} />
      <Table colSpan={cols.length + 1} empty={!rows.length}
        head={<>{cols.map((c) => <th key={c.key} className={c.hideSm ? "hidden md:table-cell" : ""}>{c.label}</th>)}<th>Actions</th></>}>
        {rows.map((row) => (
          <tr key={row.id}>
            {cols.map((c, i) => (
              <td key={c.key} className={`${c.hideSm ? "hidden md:table-cell" : ""} ${i === 0 ? "text-white font-medium" : "text-gray-400"}`}>
                {i === 0 ? <Link href={`/admin/${key}/${row.id}`} className="hover:text-cyan-400"><Cell row={row} col={c} /></Link> : <Cell row={row} col={c} />}
              </td>
            ))}
            <td>
              <div className="flex flex-wrap gap-3 text-xs">
                <Link href={`/admin/${key}/${row.id}`} className="text-cyan-400 hover:text-cyan-300">Edit</Link>
                {res.extraLink && <Link href={res.extraLink.href.replace("{id}", String(row.id))} className="text-cyan-400 hover:text-cyan-300">{res.extraLink.label}</Link>}
                {res.publicBase && typeof row.slug === "string" && (
                  <a href={`/${res.publicBase}/${row.slug}`} target="_blank" className="text-gray-400 hover:text-white">View</a>
                )}
                <ActionButton action={deleteResource.bind(null, key, row.id)} confirm={`Hapus ${res.singular.toLowerCase()} ini?`}>Delete</ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination base={`/admin/${key}`} query={{ page: query.page }} total={count ?? 0} perPage={PER_PAGE} />
    </>
  );
}
