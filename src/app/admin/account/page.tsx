import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { updateAccount } from "../actions";
import { Card } from "../parts";
import { ActionForm } from "../ui";

export const metadata: Metadata = { title: "Akun Saya" };

export default async function AccountPage() {
  const { profile } = await requireAdmin();
  const label = "text-gray-400 text-sm mb-1 block";
  return (
    <div className="max-w-xl">
      <Card>
        <ActionForm action={updateAccount}>
          <div className="space-y-4">
            <div><span className={label}>Email</span><p className="text-white">{profile.email}</p></div>
            <div><span className={label}>Role</span><p className="text-white">{profile.role === "super_admin" ? "Super Admin" : "Admin"}</p></div>
            <label className="block"><span className={label}>Name *</span><input name="name" required maxLength={255} defaultValue={profile.name} className="input" /></label>
            <h3 className="text-white font-heading font-semibold pt-4">Ganti Password</h3>
            <p className="text-gray-500 text-xs -mt-2">Kosongkan jika tidak ingin mengganti password.</p>
            <label className="block"><span className={label}>Password baru</span><input type="password" name="password" minLength={8} autoComplete="new-password" className="input" /></label>
            <label className="block"><span className={label}>Ulangi password baru</span><input type="password" name="password_confirmation" minLength={8} autoComplete="new-password" className="input" /></label>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
