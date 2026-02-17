"use client";

import { useState } from "react";
import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { WorkflowCreateModel, User } from "@/types/workflows";
import { WfStageList } from "./wf-stage-list";
import { WfStageDetail } from "./wf-stage-detail";

interface WfStagesProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly fieldArray: UseFieldArrayReturn<
    WorkflowCreateModel,
    "data.stages"
  >;
  readonly users: User[];
  readonly isDisabled: boolean;
}

export function WfStages({
  form,
  fieldArray,
  users,
  isDisabled,
}: WfStagesProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { fields } = fieldArray;

  const safeIndex = selectedIndex >= fields.length ? 0 : selectedIndex;

  return (
    <div className="flex gap-3 pt-3">
      <div className="w-48 shrink-0">
        <WfStageList
          form={form}
          fieldArray={fieldArray}
          selectedIndex={safeIndex}
          onSelect={setSelectedIndex}
          isDisabled={isDisabled}
        />
      </div>

      <div className="flex-1 rounded border p-3">
        {fields.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-6 text-center">
            No stages configured.
          </p>
        ) : (
          <WfStageDetail
            key={fields[safeIndex]?.id}
            form={form}
            fieldArray={fieldArray}
            index={safeIndex}
            users={users}
            isDisabled={isDisabled}
            isFirst={safeIndex === 0}
            isLast={safeIndex === fields.length - 1}
          />
        )}
      </div>
    </div>
  );
}
