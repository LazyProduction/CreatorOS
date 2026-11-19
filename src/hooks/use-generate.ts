"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generate } from "@/app/actions/ai";
import type { Kind, KindOutput } from "@/lib/ai/kinds";

export function useGenerate<K extends Kind>(kind: K, initial?: KindOutput<K> | null) {
  const router = useRouter();
  const [output, setOutput] = useState<KindOutput<K> | null>(initial ?? null);
  const [pending, start] = useTransition();

  function run(args: { projectId?: string | null; theme?: string; extra?: string }, onDone?: (o: KindOutput<K>) => void) {
    start(async () => {
      const res = await generate(kind, args);
      if (!res.ok) {
        if (res.code === "insufficient_credits") {
          toast.error(res.error, { action: { label: "Recharger", onClick: () => router.push("/settings/billing") } });
        } else {
          toast.error(res.error);
        }
        return;
      }
      setOutput(res.output);
      if (res.demo) toast.message("Mode démo : exemple généré sans appel à l'IA ni crédit débité.");
      onDone?.(res.output);
      router.refresh();
    });
  }

  return { output, setOutput, pending, run };
}
