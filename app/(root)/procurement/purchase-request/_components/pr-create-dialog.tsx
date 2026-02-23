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
import EmptyComponent from "@/components/empty-component";
import PrSelectTemplate from "./pr-select-template";

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
      <DialogContent
        className={
          view === "choice" ? "gap-3 p-4 sm:max-w-sm" : "gap-3 p-4 sm:max-w-lg"
        }
      >
        {view === "choice" ? (
          <>
            <DialogHeader className="gap-1">
              <DialogTitle className="text-sm">
                Create Purchase Request
              </DialogTitle>
              <DialogDescription className="text-xs">
                Choose how you want to create a new purchase request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleBlankPR}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-4 text-xs hover:bg-accent transition-colors"
              >
                <FileText className="size-6 text-muted-foreground" />
                <span className="font-medium">Blank PR</span>
              </button>
              <button
                type="button"
                onClick={() => setView("template")}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-4 text-xs hover:bg-accent transition-colors"
              >
                <LayoutTemplate className="size-6 text-muted-foreground" />
                <span className="font-medium">PR Template</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="gap-1">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setView("choice")}
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <DialogTitle className="text-sm">Select Template</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Choose a template to prefill your purchase request.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-112 overflow-auto space-y-2">
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading &&
                templates &&
                templates.length > 0 &&
                templates.map((template) => (
                  <PrSelectTemplate
                    key={template.id}
                    template={template}
                    onSelect={handleSelectTemplate}
                  />
                ))}
              {!isLoading && (!templates || templates.length === 0) && (
                <EmptyComponent
                  title="No Templates Available"
                  description="Create a template to prefill your purchase request."
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
