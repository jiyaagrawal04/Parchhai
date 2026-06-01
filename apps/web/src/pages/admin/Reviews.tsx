import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Row { id: string; product: string; author: string; rating: number; title: string | null; body: string | null; status: string; }

export default function Reviews() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => (await api.get("/admin/cms/reviews")).data.data as Row[],
  });
  const moderate = async (id: string, status: string) => {
    await api.patch(`/admin/cms/reviews/${id}`, { status });
    await qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
  };

  return (
    <div>
      <AdminHeader title="Reviews" subtitle="Moderate customer reviews" />
      {isLoading ? <PageLoader /> : (
        <Table head={["Product", "Author", "Rating", "Review", "Status", "Actions"]}>
          {data?.map((r) => (
            <tr key={r.id}>
              <Td>{r.product}</Td>
              <Td className="text-muted">{r.author}</Td>
              <Td className="text-gold">{"★".repeat(r.rating)}</Td>
              <Td className="max-w-sm"><span className="font-medium">{r.title}</span> <span className="text-muted">{r.body}</span></Td>
              <Td><Badge tone={r.status === "APPROVED" ? "success" : r.status === "HIDDEN" ? "danger" : "warn"}>{r.status}</Badge></Td>
              <Td>
                <div className="flex gap-1">
                  <button onClick={() => moderate(r.id, "APPROVED")} className="border border-line px-2 py-1 text-xs hover:border-indigo">Approve</button>
                  <button onClick={() => moderate(r.id, "HIDDEN")} className="border border-line px-2 py-1 text-xs text-rust hover:border-rust">Hide</button>
                </div>
              </Td>
            </tr>
          ))}
          {data?.length === 0 && <tr><Td className="text-muted">No reviews.</Td></tr>}
        </Table>
      )}
    </div>
  );
}
