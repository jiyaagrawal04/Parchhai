import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";
import { useState } from "react";

interface Row { id: string; orderNumber: string; customer: string; reason: string; status: string; refundStatus: string; createdAt: string; }

export default function Returns() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "returns"],
    queryFn: async () => (await api.get("/admin/orders/returns/queue")).data.data as Row[],
  });

  const decide = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/returns/${id}`, { status, restock: status === "REFUNDED" });
      await qc.invalidateQueries({ queryKey: ["admin", "returns"] });
      setMsg(`Return ${status.toLowerCase()}`);
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <AdminHeader title="Returns" subtitle="Review, approve and refund return requests" />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}
      {isLoading ? <PageLoader /> : (
        <Table head={["Order", "Customer", "Reason", "Status", "Refund", "Date", "Actions"]}>
          {data?.map((r) => (
            <tr key={r.id}>
              <Td className="font-medium">{r.orderNumber}</Td>
              <Td>{r.customer}</Td>
              <Td className="max-w-xs text-muted">{r.reason}</Td>
              <Td><Badge tone={r.status === "REFUNDED" ? "success" : r.status === "REJECTED" ? "danger" : "warn"}>{r.status}</Badge></Td>
              <Td className="text-muted">{r.refundStatus}</Td>
              <Td className="text-muted">{formatDate(r.createdAt)}</Td>
              <Td>
                {!["REFUNDED", "REJECTED"].includes(r.status) && (
                  <div className="flex gap-1">
                    {r.status === "REQUESTED" && <button onClick={() => decide(r.id, "APPROVED")} className="border border-line px-2 py-1 text-xs hover:border-indigo">Approve</button>}
                    <button onClick={() => decide(r.id, "REFUNDED")} className="border border-line px-2 py-1 text-xs hover:border-indigo">Refund + restock</button>
                    <button onClick={() => decide(r.id, "REJECTED")} className="border border-line px-2 py-1 text-xs text-rust hover:border-rust">Reject</button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
          {data?.length === 0 && <tr><Td className="text-muted">No return requests.</Td></tr>}
        </Table>
      )}
    </div>
  );
}
