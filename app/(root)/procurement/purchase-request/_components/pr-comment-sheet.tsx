"use client";

import { useRef, useState } from "react";
import {
  Check,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import {
  usePurchaseRequestComments,
  useCreatePurchaseRequestComment,
  useUpdatePurchaseRequestComment,
  useDeletePurchaseRequestComment,
  uploadCommentAttachment,
  type PurchaseRequestComment,
  type PurchaseRequestCommentAttachment,
} from "@/hooks/use-purchase-request";
import EmptyComponent from "@/components/empty-component";

interface PrCommentSheetProps {
  readonly prId: string | undefined;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function getFullName(c: PurchaseRequestComment) {
  return [c.firstname, c.middlename, c.lastname].filter(Boolean).join(" ");
}

export function PrCommentSheet({
  prId,
  open,
  onOpenChange,
}: PrCommentSheetProps) {
  const { data: profile, buCode, dateFormat } = useProfile();
  const currentUserId = profile?.id;

  const [message, setMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<
    PurchaseRequestCommentAttachment[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<PurchaseRequestComment | null>(null);

  const { data: comments = [], isLoading } = usePurchaseRequestComments(
    open ? prId : undefined,
  );
  const createComment = useCreatePurchaseRequestComment();
  const updateComment = useUpdatePurchaseRequestComment();
  const deleteComment = useDeletePurchaseRequestComment();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = new Set([
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "text/markdown",
  ]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !prId || !buCode) return;

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error(`"${file.name}" — only images and documents are allowed`);
      } else if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 10 MB limit`);
      } else {
        validFiles.push(file);
      }
    }
    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        validFiles.map((file) => uploadCommentAttachment(buCode, prId, file)),
      );
      setPendingFiles((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!prId || (!message.trim() && pendingFiles.length === 0)) return;

    createComment.mutate(
      {
        purchase_request_id: prId,
        message: message.trim(),
        type: "user",
        attachments: pendingFiles,
      },
      {
        onSuccess: () => {
          setMessage("");
          setPendingFiles([]);
          toast.success("Comment added");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const startEdit = (c: PurchaseRequestComment) => {
    setEditingId(c.id);
    setEditMessage(c.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage("");
  };

  const handleUpdate = (c: PurchaseRequestComment) => {
    if (!editMessage.trim()) return;

    updateComment.mutate(
      { id: c.id, message: editMessage.trim(), attachments: c.attachments },
      {
        onSuccess: () => {
          cancelEdit();
          toast.success("Comment updated");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteComment.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Comment deleted");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const isOwner = (c: PurchaseRequestComment) =>
    currentUserId === c.created_by_id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="border-b">
          <SheetTitle className="text-xs font-semibold">
            Comments ({comments.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && comments.length === 0 && (
            <EmptyComponent
              icon={MessageCircle}
              title="No Comment Yet"
              description="You haven't created any comment yet."
            />
          )}
          {!isLoading && comments.length > 0 && (
            <div className="divide-y">
              {comments.map((c) => (
                <div key={c.id} className="px-3 py-2 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center size-5 rounded-full bg-muted shrink-0">
                      <User className="size-3 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] font-medium truncate">
                      {getFullName(c)}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      {formatDate(c.created_at, dateFormat)}
                    </span>
                  </div>

                  {editingId === c.id ? (
                    <div className="pl-6.5 space-y-1">
                      <Textarea
                        className="min-h-7 text-xs resize-none"
                        rows={2}
                        maxLength={256}
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleUpdate(c);
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          aria-label="Save comment"
                          onClick={() => handleUpdate(c)}
                          disabled={
                            !editMessage.trim() || updateComment.isPending
                          }
                        >
                          {updateComment.isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Check className="size-3" />
                          )}
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Cancel edit"
                          onClick={cancelEdit}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs pl-6.5 text-foreground/80">
                        {c.message}
                      </p>
                      {c.attachments.length > 0 && (
                        <div className="pl-6.5 flex flex-wrap gap-1 pt-0.5">
                          {c.attachments.map((att) => (
                            <a
                              key={att.fileToken}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <Paperclip className="size-2.5 shrink-0" />
                              <span className="truncate">{att.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {isOwner(c) && (
                        <div className="pl-6.5 flex justify-end gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="text-[10px] text-muted-foreground hover:text-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {prId && (
          <div className="px-3 py-2 border-t bg-muted/30 space-y-1.5">
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pendingFiles.map((file, i) => (
                  <div
                    key={file.fileToken}
                    className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <Paperclip className="size-2.5 shrink-0" />
                    <span className="truncate">{file.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removePendingFile(i)}
                      className="shrink-0 hover:text-foreground"
                      aria-label={`Remove ${file.fileName}`}
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="Attach file"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Paperclip className="size-3" />
                )}
              </Button>
              <Textarea
                placeholder="Add comment..."
                className="text-xs resize-none"
                rows={1}
                maxLength={256}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon-xs"
                aria-label="Send comment"
                onClick={handleSubmit}
                disabled={
                  (!message.trim() && pendingFiles.length === 0) ||
                  createComment.isPending
                }
              >
                {createComment.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Send className="size-3" />
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        isPending={deleteComment.isPending}
        onConfirm={handleDelete}
      />
    </Sheet>
  );
}
