"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrWorkflowStepProps {
  readonly previousStage?: string;
  readonly currentStage: string;
  readonly nextStage?: string;
}

export function PrWorkflowStep({
  previousStage,
  currentStage,
  nextStage,
}: PrWorkflowStepProps) {
  const stages = [previousStage, currentStage, nextStage].filter(
    (s): s is string => !!s,
  );

  if (stages.length === 0) return null;

  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {stages.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white",
                  isCompleted && "bg-success",
                  isCurrent && "bg-info ring-2 ring-info/30",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="size-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs",
                  isCompleted && "text-success-foreground",
                  isCurrent && "font-semibold text-info-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground",
                )}
              >
                {stage}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
