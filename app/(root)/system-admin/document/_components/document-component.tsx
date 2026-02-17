"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import {
  useDocument,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/use-document";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { DocumentFile } from "@/types/document";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import { useDocumentTable } from "./use-document-table";
import { Input } from "@/components/ui/input";

export default function DocumentComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentFile | null>(null);
  const deleteDocument = useDeleteDocument();
  const uploadDocument = useUploadDocument();
  const { params, search, setSearch, tableConfig } = useDataGridState();
  const { data, isLoading, error, refetch } = useDocument(params);

  const documents = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useDocumentTable({
    documents,
    totalRecords,
    params,
    tableConfig,
    onDelete: setDeleteTarget,
  });

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 10 MB limit");
      e.target.value = "";
      return;
    }
    uploadDocument.mutate(file, {
      onSuccess: () => toast.success("Document uploaded successfully"),
      onError: (err) => toast.error(err.message),
    });
    e.target.value = "";
  };

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Document Management"
      description="Upload and manage documents."
      toolbar={<SearchInput defaultValue={search} onSearch={setSearch} />}
      actions={
        <>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.handleUpload,.docx,.xls,.xlsx,.csv,.txt"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDocument.isPending}
          >
            <Upload />
            {uploadDocument.isPending ? "Uploading..." : "Upload"}
          </Button>
        </>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteDocument.isPending && setDeleteTarget(null)
        }
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.originalName}"? This action cannot be undone.`}
        isPending={deleteDocument.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDocument.mutate(deleteTarget.fileToken, {
            onSuccess: () => {
              toast.success("Document deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
