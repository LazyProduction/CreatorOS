"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "animate-fade-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-bg-elevated p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl",
          className,
        )}
      >
        <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
        {title && <h2 className="pr-8 text-lg font-semibold">{title}</h2>}
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        <div className={cn(title && "mt-5")}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
