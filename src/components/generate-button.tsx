"use client";

import { Sparkles, Zap } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { KINDS, type Kind } from "@/lib/ai/kinds";

export function GenerateButton({ kind, children, again, ...props }: ButtonProps & { kind: Kind; again?: boolean }) {
  const cost = KINDS[kind].credits;
  return (
    <Button {...props}>
      {!props.loading && <Sparkles className="h-4 w-4" />}
      {children ?? (again ? "Régénérer" : `Générer`)}
      <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-md bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold">
        <Zap className="h-2.5 w-2.5" />
        {cost}
      </span>
    </Button>
  );
}
