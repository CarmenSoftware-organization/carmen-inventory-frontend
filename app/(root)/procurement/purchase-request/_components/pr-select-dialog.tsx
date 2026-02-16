import { CheckSquare, ListChecks } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm">Select Items</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Choose which items to select.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 text-xs"
            onClick={onSelectAll}
          >
            <ListChecks className="size-3.5" />
            Select All Purchase Request Items ({allCount} Items)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 text-xs"
            onClick={onSelectPending}
          >
            <CheckSquare className="size-3.5" />
            Select Only Status Pending ({pendingCount} Items)
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-7 text-xs">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
