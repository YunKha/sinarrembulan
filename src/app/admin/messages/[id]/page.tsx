import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/cards";
import { requireAdmin } from "@/lib/admin";
import { deleteMessage, setMessageReplied } from "../../actions";
import { Card, dateTime } from "../../parts";
import { ActionButton } from "../../ui";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: m } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();
  // Dibuka = sudah dibaca (sama seperti Laravel).
  if (!m.is_read) await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);

  const Info = ({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) => (
    <div className={wide ? "sm:col-span-2" : ""}><p className="text-gray-400 text-xs mb-1">{label}</p><div className="text-white">{children}</div></div>
  );

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/messages" label="Back" />
      <Card className="mt-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Info label="From"><span className="font-semibold">{m.name}</span></Info>
          <Info label="Email"><a href={`mailto:${m.email}`} className="hover:text-cyan-400">{m.email}</a></Info>
          {m.phone && <Info label="Phone"><a href={`tel:${m.phone}`} className="hover:text-cyan-400">{m.phone}</a></Info>}
          {m.company && <Info label="Company">{m.company}</Info>}
          <Info label="Date" wide>{dateTime(m.created_at)}</Info>
        </div>
        <div className="border-t border-white/5 pt-6">
          <p className="text-gray-400 text-xs mb-1">Subject</p>
          <p className="text-white font-semibold text-lg mb-4">{m.subject}</p>
          <p className="text-gray-400 text-xs mb-1">Message</p>
          <div className="text-gray-300 whitespace-pre-line leading-relaxed">{m.message}</div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="btn-primary text-sm px-5! py-2!">Reply via Email</a>
          <ActionButton action={setMessageReplied.bind(null, id, !m.is_replied)}
            className="text-sm px-5 py-2 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-all">
            {m.is_replied ? "✓ Sudah dibalas (batalkan)" : "Tandai sudah dibalas"}
          </ActionButton>
          <ActionButton action={deleteMessage.bind(null, id)} confirm="Hapus pesan ini?"
            className="text-red-400 hover:text-red-300 text-sm px-5 py-2 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
            Delete
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}
