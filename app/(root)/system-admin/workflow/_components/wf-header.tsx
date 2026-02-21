"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useDeleteWorkflow } from "@/hooks/use-workflow";
import type { Workflow } from "@/types/workflows";

const typeLabels: Record<string, string> = {
  purchase_request_workflow: "Purchase Request",
  store_requisition_workflow: "Store Requisition",
  purchase_order_workflow: "Purchase Order",
};

interface WfHeaderProps {
  readonly workflow: Workflow;
  readonly isEditing: boolean;
  readonly isPending: boolean;
  readonly onEdit: () => void;
  readonly onCancel: () => void;
  readonly formId: string;
}

export function WfHeader({
  workflow,
  isEditing,
  isPending,
  onEdit,
  onCancel,
  formId,
}: WfHeaderProps) {
  const router = useRouter();
  const deleteWorkflow = useDeleteWorkflow();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/system-admin/workflow")}
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <h1 className="text-sm font-semibold">
            {isEditing ? "Edit Workflow" : workflow.name}
          </h1>
          {!isEditing && (
            <Badge
              variant={workflow.is_active ? "success" : "destructive"}
              className="text-[10px] px-1.5 py-0"
            >
              {workflow.is_active ? "Active" : "Inactive"}
            </Badge>
          )}
          {!isEditing && (
            <>
              <Separator orientation="vertical" className="mx-1 h-3.5" />
              <span className="text-[10px] text-muted-foreground">
                {typeLabels[workflow.workflow_type] ?? workflow.workflow_type}
              </span>
              <Separator orientation="vertical" className="mx-1 h-3.5" />
              <span className="text-[10px] text-muted-foreground font-mono">
                {workflow.id.slice(0, 8)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form={formId}
                disabled={isPending}
                className="text-xs"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={onEdit} className="text-xs">
                <Pencil className="size-3" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDelete(true)}
                disabled={deleteWorkflow.isPending}
                className="text-xs"
              >
                <Trash2 className="size-3" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {workflow.description && !isEditing && (
        <p className="text-[11px] text-muted-foreground ml-7">
          {workflow.description}
        </p>
      )}

      <DeleteDialog
        open={showDelete}
        onOpenChange={(open) =>
          !open && !deleteWorkflow.isPending && setShowDelete(false)
        }
        title="Delete Workflow"
        description={`Are you sure you want to delete workflow "${workflow.name}"? This action cannot be undone.`}
        isPending={deleteWorkflow.isPending}
        onConfirm={() => {
          deleteWorkflow.mutate(workflow.id, {
            onSuccess: () => {
              setShowDelete(false);
              toast.success("Workflow deleted successfully");
              router.push("/system-admin/workflow");
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </>
  );
}
