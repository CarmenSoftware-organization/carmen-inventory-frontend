"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FileInput } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const SelectPRDialog = dynamic(
  () => import("./po-select-pr-dialog").then((mod) => mod.SelectPRDialog),
);

interface CreatePODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePODialog({ open, onOpenChange }: CreatePODialogProps) {
  const router = useRouter();
  const [prDialogOpen, setPrDialogOpen] = useState(false);

  const handleBlankPO = () => {
    onOpenChange(false);
    router.push("/procurement/purchase-order/new");
  };

  const handleFromPR = () => {
    onOpenChange(false);
    setPrDialogOpen(true);
  };

  const handleSelectPR = (prId: string) => {
    setPrDialogOpen(false);
    router.push(`/procurement/purchase-order/new?pr_id=${prId}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Choose how you want to create a new purchase order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleBlankPO}
              className="flex flex-col items-center gap-2 rounded-lg border p-6 text-sm hover:bg-accent transition-colors"
            >
              <FileText className="size-8 text-muted-foreground" />
              <span className="font-medium">Blank PO</span>
            </button>
            <button
              type="button"
              onClick={handleFromPR}
              className="flex flex-col items-center gap-2 rounded-lg border p-6 text-sm hover:bg-accent transition-colors"
            >
              <FileInput className="size-8 text-muted-foreground" />
              <span className="font-medium">From PR</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <SelectPRDialog
        open={prDialogOpen}
        onOpenChange={setPrDialogOpen}
        onSelect={handleSelectPR}
      />
    </>
  );
}
