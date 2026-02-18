import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FileSpreadsheet,
  FileText,
  FileImage,
  File,
  FileArchive,
  FileCode,
} from "lucide-react";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import {
  selectColumn,
  indexColumn,
  actionColumn,
} from "@/components/ui/data-grid/columns";
import type { DocumentFile } from "@/types/document";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";

interface UseDocumentTableOptions {
  documents: DocumentFile[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onDelete: (doc: DocumentFile) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeInfo(contentType: string) {
  if (
    contentType.includes("spreadsheet") ||
    contentType.includes("excel") ||
    contentType.includes("csv")
  )
    return {
      icon: FileSpreadsheet,
      label: "XLS",
      className: "text-green-600",
    };
  if (contentType.includes("pdf"))
    return { icon: FileText, label: "PDF", className: "text-red-500" };
  if (contentType.includes("image"))
    return { icon: FileImage, label: "Image", className: "text-blue-500" };
  if (
    contentType.includes("zip") ||
    contentType.includes("rar") ||
    contentType.includes("compressed")
  )
    return {
      icon: FileArchive,
      label: "Archive",
      className: "text-amber-500",
    };
  if (contentType.includes("text/plain"))
    return { icon: FileText, label: "TXT", className: "text-gray-500" };
  if (contentType.includes("word") || contentType.includes("document"))
    return {
      icon: FileText,
      label: "DOC",
      className: "text-blue-600",
    };
  if (
    contentType.includes("json") ||
    contentType.includes("xml") ||
    contentType.includes("html")
  )
    return { icon: FileCode, label: "Code", className: "text-purple-500" };
  return { icon: File, label: "File", className: "text-muted-foreground" };
}

export function useDocumentTable({
  documents,
  totalRecords,
  params,
  tableConfig,
  onDelete,
}: UseDocumentTableOptions) {
  "use no memo";

  const { dateFormat } = useProfile();

  const columns: ColumnDef<DocumentFile>[] = [
    selectColumn<DocumentFile>(),
    indexColumn<DocumentFile>(params),
    {
      accessorKey: "originalName",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="File Name" />
      ),
      cell: ({ row }) => (
        <span
          className="font-medium text-xs block truncate max-w-100"
          title={row.getValue("originalName")}
        >
          {row.getValue("originalName")}
        </span>
      ),
      size: 300,
    },
    {
      accessorKey: "contentType",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const contentType: string = row.getValue("contentType");
        const { icon: Icon, label, className } = getFileTypeInfo(contentType);
        return (
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${className}`} />
            <span className="text-xs">{label}</span>
          </div>
        );
      },
      size: 110,
    },
    {
      accessorKey: "size",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => formatFileSize(row.getValue("size")),
      size: 100,
    },
    {
      accessorKey: "lastModified",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Last Modified" />
      ),
      cell: ({ row }) => formatDate(row.getValue("lastModified"), dateFormat),
      size: 120,
    },
    actionColumn<DocumentFile>(onDelete),
  ];

  return useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
