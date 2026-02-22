"use client";

import { useProfile } from "@/hooks/use-profile";
import {
  usePurchaseRequestComments,
  useCreatePurchaseRequestComment,
  useUpdatePurchaseRequestComment,
  useDeletePurchaseRequestComment,
  uploadCommentAttachment,
} from "@/hooks/use-purchase-request";
import { CommentSheet } from "@/components/ui/comment-sheet";

interface PrCommentSheetProps {
  readonly prId: string | undefined;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function PrCommentSheet({
  prId,
  open,
  onOpenChange,
}: PrCommentSheetProps) {
  const { data: profile, buCode, dateFormat } = useProfile();

  const { data: comments = [], isLoading } = usePurchaseRequestComments(
    open ? prId : undefined,
  );
  const createComment = useCreatePurchaseRequestComment();
  const updateComment = useUpdatePurchaseRequestComment();
  const deleteComment = useDeletePurchaseRequestComment();

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
          purchase_request_id: prId!,
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
        prId && buCode
          ? (file) => uploadCommentAttachment(buCode, prId, file)
          : undefined
      }
    />
  );
}
