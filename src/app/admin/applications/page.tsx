import type { Metadata } from "next";
import Form from "next/form";
import { Pagination } from "@/components/cards";
import { requireAdmin } from "@/lib/admin";
import { deleteApplication, setApplicationStatus } from "../actions";
import { Flash, PageHead, PER_PAGE, Table, dateTime, pageRange } from "../parts";
import { APPLICATION_STATUSES } from "../resources";
import { ActionButton, StatusSelect } from "../ui";

export const metadata: Metadata = { title: "Lamaran" };

type Props = { searchParams: Promise<{ ok?: string; page?: string; career?: string; status?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);

  let q = supabase.from("career_applications").select("*, career:careers(title)", { count: "exact" });
  if (Number(query.career)) q = q.eq("career_id", Number(query.career));
  if (query.status) q = q.eq("status", query.status);
  const [{ data, count }, { data: careers }] = await Promise.all([
    q.order("created_at", { ascending: false }).range(...pageRange(page)),
    supabase.from("careers").select("id, title").order("created_at", { ascending: false }),
  ]);
  const rows = data ?? [];

  // CV ada di bucket privat: buat link unduh sementara (berlaku 1 jam) untuk baris yang tampil.
  const { data: signed } = rows.length
    ? await supabase.storage.from("cv").createSignedUrls(rows.map((r) => r.cv_file), 3600)
    : { data: [] };
  const cvUrl = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  const select = "bg-white/5 border border-white/10 rounded-xl text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-500";

  return (
    <>
      <Flash ok={query.ok} />
      <PageHead title="Lamaran Kerja" />
      <Form action="/admin/applications" className="flex flex-wrap gap-3 mb-6">
        <select name="career" defaultValue={query.career ?? ""} className={select} aria-label="Filter lowongan">
          <option value="">Semua lowongan</option>
          {careers?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select name="status" defaultValue={query.status ?? ""} className={select} aria-label="Filter status">
          <option value="">Semua status</option>
          {APPLICATION_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="btn-secondary text-sm px-5! py-2!">Filter</button>
      </Form>

      <Table colSpan={5} empty={!rows.length}
        head={<><th>Pelamar</th><th className="hidden md:table-cell">Posisi</th><th className="hidden lg:table-cell">Tanggal</th><th>Status</th><th>Actions</th></>}>
        {rows.map((a) => (
          <tr key={a.id} className="align-top">
            <td>
              <p className="text-white font-medium">{a.name}</p>
              <p className="text-gray-500 text-xs"><a href={`mailto:${a.email}`} className="hover:text-cyan-400">{a.email}</a> • {a.phone}</p>
              <div className="flex gap-3 text-xs mt-1">
                {a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400">LinkedIn</a>}
                {a.portfolio_url && <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400">Portfolio</a>}
              </div>
              {a.cover_letter && (
                <details className="mt-2 text-xs">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">Cover letter</summary>
                  <p className="text-gray-300 whitespace-pre-line mt-2 max-w-md">{a.cover_letter}</p>
                </details>
              )}
            </td>
            <td className="text-gray-400 hidden md:table-cell">{(a.career as { title: string } | null)?.title ?? "-"}</td>
            <td className="text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">{dateTime(a.created_at)}</td>
            <td><StatusSelect value={a.status} options={APPLICATION_STATUSES} action={setApplicationStatus.bind(null, a.id)} /></td>
            <td>
              <div className="flex flex-col gap-2 text-xs">
                {cvUrl.get(a.cv_file) ? (
                  <a href={cvUrl.get(a.cv_file)} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Download CV</a>
                ) : <span className="text-gray-600">CV tidak ada</span>}
                <ActionButton action={deleteApplication.bind(null, a.id)} confirm="Hapus lamaran ini beserta file CV-nya?">Delete</ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination base="/admin/applications" query={{ career: query.career, status: query.status, page: query.page }} total={count ?? 0} perPage={PER_PAGE} />
    </>
  );
}
