import { useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { MIcon } from "@/components/Reveal";

/** Centered modal that floats in (fade + scale) and floats out on close. */
export function Modal({ children, onClose, className, align = "center" }: { children: ReactNode; onClose: () => void; className?: string; align?: "center" | "top" }) {
  const [closing, setClosing] = useState(false);
  const close = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };
  return (
    <div className={cx("animate-overlay fixed inset-0 z-[60] flex justify-center bg-black/50 p-4 backdrop-blur-sm", align === "top" ? "items-start pt-[12vh]" : "items-center", closing && "closing")} onClick={close}>
      <div className={cx("animate-float relative max-h-[90vh] overflow-y-auto bg-surface shadow-2xl", className ?? "w-full max-w-md p-8")} onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-on-surface-variant transition-colors hover:text-primary"><MIcon name="close" /></button>
        {children}
      </div>
    </div>
  );
}

/** Right-hand drawer that slides in. Renders a header with title + close. */
export function Drawer({ children, onClose, title }: { children: ReactNode; onClose: () => void; title?: string }) {
  const [closing, setClosing] = useState(false);
  const close = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };
  return (
    <div className={cx("animate-overlay fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm", closing && "closing")} onClick={close}>
      <div className="animate-drawer flex h-full w-full max-w-md flex-col bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
          <h2 className="font-headline-md text-xl text-primary">{title}</h2>
          <button onClick={close} aria-label="Close" className="text-on-surface-variant transition-colors hover:text-primary"><MIcon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
