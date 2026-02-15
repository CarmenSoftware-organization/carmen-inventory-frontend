"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflow } from "@/hooks/use-workflow";

interface LookupWorkflowProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly workflowType?: string;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupWorkflow({
  value,
  onValueChange,
  workflowType,
  disabled,
  placeholder = "Select workflow",
  className,
}: LookupWorkflowProps) {
  const { data } = useWorkflow({ perpage: 9999 });
  const workflows =
    data?.data?.filter(
      (w) =>
        w.is_active &&
        (!workflowType || w.workflow_type === workflowType),
    ) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {workflows.map((wf) => (
          <SelectItem key={wf.id} value={wf.id}>
            {wf.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
