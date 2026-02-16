import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PrSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allCount: number;
  pendingCount: number;
  onSelectAll: () => void;
  onSelectPending: () => void;
}

export function PrSelectDialog({
  open,
  onOpenChange,
  allCount,
  pendingCount,
  onSelectAll,
  onSelectPending,
}: PrSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Select Items</DialogTitle>
          <DialogDescription>Choose which items to select.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={onSelectAll}
          >
            Select All Purchase Request Items ({allCount} Items)
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={onSelectPending}
          >
            Select Only Purchase Request Status Pending ({pendingCount} Items)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
