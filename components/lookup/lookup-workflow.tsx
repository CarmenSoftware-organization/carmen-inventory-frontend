"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflowTypeQuery } from "@/hooks/use-workflow";
import { WORKFLOW_TYPE } from "@/types/workflows";

interface LookupWorkflowProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly workflowType: WORKFLOW_TYPE;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupWorkflow({
  value,
  onValueChange,
  workflowType,
  disabled,
  placeholder = "Select workflow",
  className,
  size = "sm",
}: LookupWorkflowProps) {
  const { data: workflows } = useWorkflowTypeQuery(workflowType);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {workflows?.map((wf) => (
          <SelectItem key={wf.id} value={wf.id} className="text-xs">
            {wf.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
