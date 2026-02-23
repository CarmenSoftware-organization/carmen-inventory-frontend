import { Badge } from "@/components/ui/badge";
import { PurchaseRequestTemplate } from "@/types/purchase-request";
import { Package } from "lucide-react";

interface Props {
  template: PurchaseRequestTemplate;
  onSelect: (id: string) => void;
}

const PREVIEW_LIMIT = 3;

export default function PrSelectTemplate({ template, onSelect }: Props) {
  const items = template.purchase_request_template_detail;
  const previewItems = items.slice(0, PREVIEW_LIMIT);
  const remaining = items.length - PREVIEW_LIMIT;

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="flex w-full flex-col gap-1.5 rounded-md border p-2.5 text-left text-xs hover:bg-accent transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium truncate">{template.name}</span>
        <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex gap-2 text-[11px] text-muted-foreground">
        <span>{template.department_name}</span>
        <span>&middot;</span>
        <span>{template.workflow_name}</span>
      </div>

      {/* Item preview */}
      {items.length > 0 && (
        <div className="mt-0.5 rounded bg-muted/50 p-1.5 space-y-1">
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <Package aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{item.product_name}</span>
              <span className="ml-auto shrink-0 tabular-nums">
                {item.requested_qty} {item.requested_unit_name}
              </span>
            </div>
          ))}
          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground/70 pl-4.5">
              +{remaining} more {remaining === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      )}
    </button>
  );
}
