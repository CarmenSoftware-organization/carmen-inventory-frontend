"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PrActionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly confirmVariant?: "default" | "destructive";
  readonly isPending?: boolean;
  readonly onConfirm: (message: string) => void;
}

export function PrActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  isPending,
  onConfirm,
}: PrActionDialogProps) {
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(message);
    setMessage("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setMessage("");
    onOpenChange(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="gap-3 p-4 sm:max-w-sm">
        <AlertDialogHeader className="gap-0.5">
          <AlertDialogTitle className="text-sm">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-xs">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Reason</Label>
          <Textarea
            className="text-xs placeholder:text-xs"
            placeholder="Enter reason (optional)..."
            maxLength={256}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size="sm"
            variant={confirmVariant}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
