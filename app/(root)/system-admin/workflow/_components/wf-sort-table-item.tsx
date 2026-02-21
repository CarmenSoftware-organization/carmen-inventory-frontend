import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableStageItemProps {
  readonly id: string;
  readonly index: number;
  readonly name: string;
  readonly isSelected: boolean;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onClick: () => void;
}

export default function SortableStageItem({
  id,
  index,
  name,
  isSelected,
  isFirst,
  isLast,
  onClick,
}: SortableStageItemProps) {
  const isDragDisabled = isFirst || isLast;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 rounded border px-1.5 py-1 text-[11px]",
        isSelected && "border-primary bg-primary/5",
        isDragging && "opacity-50",
      )}
    >
      {isDragDisabled ? (
        <span className="w-3" />
      ) : (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3" />
        </button>
      )}
      <button
        type="button"
        className="flex flex-1 items-center gap-1.5 cursor-pointer bg-transparent text-left"
        onClick={onClick}
      >
        {isLast ? (
          <CheckCircle2 className="size-3 text-green-600" />
        ) : (
          <span className="text-muted-foreground text-[10px]">{index + 1}.</span>
        )}
        <span className="truncate flex-1">{name}</span>
      </button>
    </div>
  );
}
