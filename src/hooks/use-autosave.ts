"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Enregistre automatiquement un patch après un délai sans frappe. */
export function useAutosave<T>(save: (patch: T) => Promise<unknown>, delay = 800) {
  const [state, setState] = useState<SaveState>("idle");
  const pending = useRef<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (!patch) return;
    pending.current = null;
    setState("saving");
    try {
      await saveRef.current(patch);
      setState("saved");
    } catch {
      setState("error");
    }
  }, []);

  const queue = useCallback(
    (patch: T) => {
      pending.current = { ...(pending.current ?? {}), ...patch } as T;
      setState("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  useEffect(() => {
    const onUnload = () => void flush();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      void flush();
    };
  }, [flush]);

  return { state, queue, flush };
}
