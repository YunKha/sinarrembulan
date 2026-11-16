import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/cards";
import { requireAdmin } from "@/lib/admin";
import { truncate } from "@/lib/data";
import { deleteMessage } from "../actions";
import { Badge, Flash, PageHead, PER_PAGE, Table, dateTime, pageRange } from "../parts";
import { ActionButton } from "../ui";

export const metadata: Metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ ok?: string; page?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const { data, count } = await supabase.from("contact_messages").select("*", { count: "exact" })
    .order("created_at", { ascending: false }).range(...pageRange(page));
  const rows = data ?? [];

  return (
    <>
      <Flash ok={query.ok} />
      <PageHead title="Contact Messages" />
      <Table colSpan={5} empty={!rows.length}
        head={<><th>From</th><th>Subject</th><th className="hidden md:table-cell">Date</th><th className="hidden md:table-cell">Status</th><th>Actions</th></>}>
        {rows.map((m) => (
          <tr key={m.id} className={m.is_read ? "" : "bg-cyan-500/5"}>
            <td><p className="text-white font-medium">{m.name}</p><p className="text-gray-500 text-xs">{m.email}</p></td>
            <td className="text-gray-300"><Link href={`/admin/messages/${m.id}`} className="hover:text-cyan-400">{truncate(m.subject, 40)}</Link></td>
            <td className="text-gray-400 text-xs hidden md:table-cell whitespace-nowrap">{dateTime(m.created_at)}</td>
            <td className="hidden md:table-cell">
              {!m.is_read ? <Badge tone="cyan">Baru</Badge> : m.is_replied ? <Badge tone="green">Dibalas</Badge> : <span className="text-gray-500 text-xs">Read</span>}
            </td>
            <td>
              <div className="flex gap-3 text-xs">
                <Link href={`/admin/messages/${m.id}`} className="text-cyan-400 hover:text-cyan-300">View</Link>
                <ActionButton action={deleteMessage.bind(null, m.id)} confirm="Hapus pesan ini?">Delete</ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <Pagination base="/admin/messages" query={{ page: query.page }} total={count ?? 0} perPage={PER_PAGE} />
    </>
  );
}
