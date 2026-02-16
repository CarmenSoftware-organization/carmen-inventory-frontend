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
  description = "Please provide a reason for this action.",
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Enter reason (optional)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          disabled={isPending}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
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
