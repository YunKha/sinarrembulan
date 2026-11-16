import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { createUser, deleteUser } from "../actions";
import { Badge, Card, Flash, PageHead, Table, dateTime } from "../parts";
import { ActionButton, ActionForm, Alert } from "../ui";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase, user, profile } = await requireAdmin();
  const { ok } = await searchParams;
  const isSuper = profile.role === "super_admin";
  const { data } = await supabase.from("profiles").select("id, name, email, role, is_active, created_at").order("created_at", { ascending: false });
  const users = data ?? [];

  return (
    <>
      <Flash ok={ok} />
      <PageHead title="Admin Users" />
      {isSuper ? (
        <Card className="mb-6">
          <h3 className="text-white font-semibold mb-4">Add Admin User</h3>
          <ActionForm action={createUser} resetOnSuccess>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <label className="block"><span className="text-gray-400 text-sm mb-1 block">Name *</span><input name="name" required maxLength={255} className="input" /></label>
              <label className="block"><span className="text-gray-400 text-sm mb-1 block">Email *</span><input type="email" name="email" required maxLength={255} autoComplete="off" className="input" /></label>
              <label className="block"><span className="text-gray-400 text-sm mb-1 block">Password * (min. 8 karakter)</span><input type="password" name="password" required minLength={8} autoComplete="new-password" className="input" /></label>
              <label className="block">
                <span className="text-gray-400 text-sm mb-1 block">Role *</span>
                <select name="role" required className="input"><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select>
              </label>
            </div>
            <button type="submit" className="btn-primary text-sm px-5! py-2.5!">Add User</button>
          </ActionForm>
          <p className="text-gray-500 text-xs mt-4">Admin bisa mengelola semua konten. Super Admin juga bisa menambah &amp; menghapus user.</p>
        </Card>
      ) : (
        <div className="mb-6"><Alert tone="error">Hanya Super Admin yang bisa menambah atau menghapus user.</Alert></div>
      )}

      <Table colSpan={4} empty={!users.length}
        head={<><th>Name</th><th>Email</th><th className="hidden md:table-cell">Role</th><th>Action</th></>}>
        {users.map((u) => (
          <tr key={u.id}>
            <td className="text-white font-medium">
              {u.name || "-"}{u.id === user.id && <span className="ml-1 text-xs text-cyan-400">(You)</span>}
              <p className="text-gray-500 text-xs font-normal">Sejak {dateTime(u.created_at)}</p>
            </td>
            <td className="text-gray-400">{u.email}</td>
            <td className="hidden md:table-cell">
              <Badge tone={u.role === "super_admin" ? "purple" : u.role === "admin" ? "cyan" : "gray"}>
                {u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : "Tanpa akses"}
              </Badge>
              {!u.is_active && <span className="ml-2"><Badge tone="red">Nonaktif</Badge></span>}
            </td>
            <td>
              {isSuper && u.id !== user.id && (
                <ActionButton action={deleteUser.bind(null, u.id)} confirm={`Hapus user ${u.email}? Akun tidak bisa login lagi.`}>Delete</ActionButton>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
