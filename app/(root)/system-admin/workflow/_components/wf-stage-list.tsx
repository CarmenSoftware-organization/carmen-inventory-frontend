"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useWatch,
  type UseFormReturn,
  type UseFieldArrayReturn,
} from "react-hook-form";
import type { WorkflowCreateModel, Stage } from "@/types/workflows";
import SortableStageItem from "./wf-sort-table-item";

interface WfStageListProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly fieldArray: UseFieldArrayReturn<WorkflowCreateModel, "data.stages">;
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
  readonly isDisabled: boolean;
}

function buildNewStage(existingNames: string[]): Stage {
  let n = 1;
  let name = `New Stage ${n}`;
  while (existingNames.includes(name)) {
    n++;
    name = `New Stage ${n}`;
  }

  return {
    name,
    description: "",
    sla: "24",
    sla_unit: "hours",
    role: "approve",
    available_actions: {
      submit: {
        is_active: false,
        recipients: {
          requestor: false,
          current_approve: false,
          next_step: false,
        },
      },
      approve: {
        is_active: true,
        recipients: {
          requestor: true,
          current_approve: false,
          next_step: true,
        },
      },
      reject: {
        is_active: true,
        recipients: {
          requestor: true,
          current_approve: false,
          next_step: false,
        },
      },
      sendback: {
        is_active: true,
        recipients: {
          requestor: true,
          current_approve: false,
          next_step: false,
        },
      },
    },
    hide_fields: { price_per_unit: false, total_price: false },
    assigned_users: [],
    is_hod: false,
  };
}

export function WfStageList({
  form,
  fieldArray,
  selectedIndex,
  onSelect,
  isDisabled,
}: WfStageListProps) {
  const { fields, move, insert } = fieldArray;
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const watchedStages = useWatch({
    control: form.control,
    name: "data.stages",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const stageIds = fields.map((f) => f.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stageIds.indexOf(active.id as string);
    const newIndex = stageIds.indexOf(over.id as string);

    if (oldIndex === 0 || oldIndex === fields.length - 1) return;
    if (newIndex === 0 || newIndex === fields.length - 1) return;

    move(oldIndex, newIndex);
    if (selectedIndex === oldIndex) onSelect(newIndex);
  };

  const handleAddStage = () => {
    const names = fields.map((f) => f.name);
    const newStage = buildNewStage(names);
    insert(fields.length - 1, newStage);
    onSelect(fields.length - 1);
  };

  const activeDragIndex = activeDragId ? stageIds.indexOf(activeDragId) : -1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium">Stages</span>
        {!isDisabled && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddStage}
            className="h-6 text-xs px-1.5"
          >
            <Plus className="size-2.5" />
            Add
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stageIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5">
            {fields.map((field, index) => (
              <SortableStageItem
                key={field.id}
                id={field.id}
                index={index}
                name={watchedStages?.[index]?.name ?? field.name}
                isSelected={selectedIndex === index}
                isFirst={index === 0}
                isLast={index === fields.length - 1}
                onClick={() => onSelect(index)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDragIndex >= 0 ? (
            <div className="flex items-center gap-1.5 rounded border bg-background px-1.5 py-1 text-[11px] shadow-md">
              <GripVertical className="size-3 text-muted-foreground" />
              <span>
                {watchedStages?.[activeDragIndex]?.name ??
                  fields[activeDragIndex]?.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
