"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, LayoutTemplate, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePurchaseRequestTemplates } from "@/hooks/use-purchase-request";

interface CreatePRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePRDialog({ open, onOpenChange }: CreatePRDialogProps) {
  const router = useRouter();
  const [view, setView] = useState<"choice" | "template">("choice");
  const { data: templates, isLoading } = usePurchaseRequestTemplates();

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) setView("choice");
  };

  const handleBlankPR = () => {
    handleOpenChange(false);
    router.push("/procurement/purchase-request/new");
  };

  const handleSelectTemplate = (templateId: string) => {
    handleOpenChange(false);
    router.push(`/procurement/purchase-request/new?template_id=${templateId}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {view === "choice" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Purchase Request</DialogTitle>
              <DialogDescription>
                Choose how you want to create a new purchase request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleBlankPR}
                className="flex flex-col items-center gap-2 rounded-lg border p-6 text-sm hover:bg-accent transition-colors"
              >
                <FileText className="size-8 text-muted-foreground" />
                <span className="font-medium">Blank PR</span>
              </button>
              <button
                type="button"
                onClick={() => setView("template")}
                className="flex flex-col items-center gap-2 rounded-lg border p-6 text-sm hover:bg-accent transition-colors"
              >
                <LayoutTemplate className="size-8 text-muted-foreground" />
                <span className="font-medium">PR Template</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setView("choice")}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <DialogTitle>Select Template</DialogTitle>
              </div>
              <DialogDescription>
                Choose a template to prefill your purchase request.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-80 overflow-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates && templates.length > 0 ? (
                templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template.id)}
                    className="flex w-full flex-col gap-1 rounded-lg border p-3 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{template.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{template.department_name}</span>
                      <span>{template.workflow_name}</span>
                      <span>
                        {template.purchase_request_template_detail.length} items
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No templates available.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
