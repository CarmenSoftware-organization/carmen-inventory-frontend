"use client";

import { useProfile } from "@/hooks/use-profile";
import {
  usePurchaseOrderComments,
  useCreatePurchaseOrderComment,
  useUpdatePurchaseOrderComment,
  useDeletePurchaseOrderComment,
  uploadPoCommentAttachment,
} from "@/hooks/use-purchase-order";
import { CommentSheet } from "@/components/ui/comment-sheet";

interface PoCommentSheetProps {
  readonly poId: string | undefined;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function PoCommentSheet({
  poId,
  open,
  onOpenChange,
}: PoCommentSheetProps) {
  const { data: profile, buCode, dateFormat } = useProfile();

  const { data: comments = [], isLoading } = usePurchaseOrderComments(
    open ? poId : undefined,
  );
  const createComment = useCreatePurchaseOrderComment();
  const updateComment = useUpdatePurchaseOrderComment();
  const deleteComment = useDeletePurchaseOrderComment();

  return (
    <CommentSheet
      open={open}
      onOpenChange={onOpenChange}
      comments={comments}
      isLoading={isLoading}
      currentUserId={profile?.id}
      dateFormat={dateFormat}
      onSubmit={async (data) => {
        await createComment.mutateAsync({
          purchase_order_id: poId!,
          message: data.message,
          type: "user",
          attachments: data.attachments,
        });
      }}
      isSubmitting={createComment.isPending}
      onUpdate={async (data) => {
        await updateComment.mutateAsync({
          id: data.id,
          message: data.message,
          attachments: data.attachments,
        });
      }}
      isUpdating={updateComment.isPending}
      onDelete={async (id) => {
        await deleteComment.mutateAsync(id);
      }}
      isDeleting={deleteComment.isPending}
      onUploadFile={
        poId && buCode
          ? (file) => uploadPoCommentAttachment(buCode, poId, file)
          : undefined
      }
    />
  );
}
