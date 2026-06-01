import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Staff { id: string; name: string; email: string | null; role: string; status: string; createdAt: string; }
interface Audit { id: string; actor: string; action: string; entity: string; at: string; }

export default function Settings() {
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: async () => (await api.get("/admin/settings")).data.data as Record<string, unknown> });
  const staff = useQuery({ queryKey: ["admin", "staff"], queryFn: async () => (await api.get("/admin/staff")).data.data as Staff[] });
  const audit = useQuery({ queryKey: ["admin", "audit"], queryFn: async () => (await api.get("/admin/audit")).data.data as Audit[] });

  if (settings.isLoading) return <PageLoader />;

  return (
    <div className="space-y-12">
      <div>
        <AdminHeader title="Settings" subtitle="Store configuration, staff and audit trail" />
        <div className="card p-5">
          <p className="label-caps mb-3 text-gold">Store settings</p>
          <pre className="overflow-x-auto bg-ivory p-4 text-xs text-ink">{JSON.stringify(settings.data, null, 2)}</pre>
        </div>
      </div>

      <div>
        <p className="mb-3 font-serif text-2xl text-indigo">Staff & roles</p>
        {staff.isLoading ? <PageLoader /> : (
          <Table head={["Name", "Email", "Role", "Status", "Since"]}>
            {staff.data?.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium">{s.name}</Td>
                <Td className="text-muted">{s.email}</Td>
                <Td><Badge>{s.role}</Badge></Td>
                <Td><Badge tone={s.status === "ACTIVE" ? "success" : "warn"}>{s.status}</Badge></Td>
                <Td className="text-muted">{formatDate(s.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      <div>
        <p className="mb-3 font-serif text-2xl text-indigo">Audit log</p>
        {audit.isLoading ? <PageLoader /> : (
          <Table head={["When", "Actor", "Action", "Entity"]}>
            {audit.data?.slice(0, 40).map((a) => (
              <tr key={a.id}>
                <Td className="text-muted">{formatDate(a.at)}</Td>
                <Td>{a.actor}</Td>
                <Td className="font-mono text-xs">{a.action}</Td>
                <Td className="font-mono text-xs text-muted">{a.entity}</Td>
              </tr>
            ))}
            {audit.data?.length === 0 && <tr><Td className="text-muted">No audit entries yet.</Td></tr>}
          </Table>
        )}
      </div>
    </div>
  );
}
