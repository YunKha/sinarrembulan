import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/cards";
import { requireAdmin } from "@/lib/admin";
import { saveResource } from "../../actions";
import { loadFormData } from "../../form-data";
import { Card, PageHead } from "../../parts";
import { RESOURCES } from "../../resources";
import { ResourceForm } from "../../ui";

type Props = { params: Promise<{ resource: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource, id } = await params;
  const res = RESOURCES[resource];
  return { title: res ? `${id === "new" ? "Add" : "Edit"} ${res.singular}` : undefined };
}

// /admin/{resource}/new = tambah, /admin/{resource}/{id} = edit.
export default async function ResourceFormPage({ params }: Props) {
  const { resource: key, id: idParam } = await params;
  const res = RESOURCES[key];
  const id = idParam === "new" ? null : Number(idParam);
  if (!res || res.singleton || (id !== null && !Number.isInteger(id))) notFound();

  const { supabase } = await requireAdmin();
  const row = id ? (await supabase.from(res.table).select("*").eq("id", id).maybeSingle()).data : {};
  if (!row) notFound();
  const { options, gallery } = await loadFormData(supabase, res, id);

  return (
    <div className="max-w-3xl">
      <BackLink href={`/admin/${key}`} label={`Back to ${res.label}`} />
      <div className="mt-2"><PageHead title={`${id ? "Edit" : "Add"} ${res.singular}`} /></div>
      <Card>
        <ResourceForm fields={res.fields} values={row} options={options} gallery={gallery}
          action={saveResource.bind(null, key, id)} cancelHref={`/admin/${key}`} submitLabel={id ? "Update" : "Save"} />
      </Card>
    </div>
  );
}
