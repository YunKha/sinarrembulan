import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { saveSettings } from "../actions";
import { Card } from "../parts";
import { SETTINGS } from "../resources";
import { ResourceForm } from "../ui";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("website_settings").select("key, value");
  const values = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return (
    <div className="max-w-3xl">
      <Card>
        <ResourceForm fields={SETTINGS.flatMap((g) => g.fields)} values={values} options={{}} action={saveSettings} submitLabel="Save Settings" />
      </Card>
    </div>
  );
}
