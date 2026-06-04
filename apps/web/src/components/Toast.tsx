import { useEffect } from "react";
import { useUI } from "@/store/ui";
import { MIcon } from "@/components/Reveal";

export function Toast() {
  const { toast, clearToast } = useUI();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2600);
    return () => clearTimeout(t);
  }, [toast?.id, clearToast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-0 right-0 z-[70] flex justify-center px-4">
      <div key={toast.id} className="animate-toast pointer-events-auto flex items-center gap-2 bg-primary px-5 py-3 text-on-primary shadow-2xl">
        <MIcon name="check_circle" className="text-[18px] text-white" />
        <span className="text-sm">{toast.msg}</span>
      </div>
    </div>
  );
}
