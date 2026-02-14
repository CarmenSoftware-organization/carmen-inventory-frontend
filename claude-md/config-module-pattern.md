# Config Module Pattern

Pattern สำหรับสร้าง CRUD module ใหม่ภายใต้ `app/(root)/config/`

---

## Instruction for Claude

เมื่อ user ต้องการสร้าง config module ใหม่ **ต้องถามคำถามเหล่านี้ก่อนเริ่มทำ** โดยใช้ AskUserQuestion tool:

### คำถามที่ต้องถาม

1. **Module name** — ชื่อ module (ภาษาอังกฤษ, singular) เช่น `category`, `warehouse`, `supplier`
2. **API path** — path ของ API endpoint เช่น `/api/proxy/api/config/{buCode}/categories`
3. **Form mode** — เปิด form แบบไหน
   - **Dialog** — form ง่าย fields น้อย เปิด dialog ใน list page (เช่น Unit)
   - **Page** — form ซับซ้อน fields เยอะ navigate ไป `/new` และ `/[id]`
4. **Fields** — มี field อะไรบ้างใน form (ชื่อ field, type, required หรือไม่, placeholder)
5. **Table columns** — อยากแสดง column อะไรบ้างใน list (ชื่อ column, sortable หรือไม่)
6. **Page title & description** — หัวข้อและคำอธิบายของหน้า list

### ตัวอย่างคำถาม

```
กรุณาให้ข้อมูลสำหรับ module ใหม่:

1. ชื่อ module? (เช่น category, warehouse)
2. API path? (เช่น /categories, /warehouses — จะต่อหลัง /api/proxy/api/config/{buCode}/)
3. Form mode? — Dialog (form ง่าย) หรือ Page (form ซับซ้อน navigate ไป /new, /[id])
4. มี field อะไรบ้างใน form?
   ตัวอย่าง:
   - name (string, required, placeholder: "e.g. Electronics")
   - description (text, optional)
   - is_active (checkbox, default: true)
5. แสดง column อะไรบ้างใน table?
   ตัวอย่าง:
   - name (sortable)
   - is_active (badge Active/Inactive)
6. Page title & description?
   ตัวอย่าง: title="Category", description="Manage categories for your inventory."
```

### หลังจากได้คำตอบแล้ว

1. สร้างไฟล์ตาม file structure ของ variant ที่เลือก (Dialog หรือ Page)
2. เพิ่ม API endpoint ที่ `constant/api-endpoints.ts`
3. ใช้ code template ด้านล่างเป็น reference
4. ปรับ fields, columns, types ตามคำตอบ

---

## Form Mode: Dialog vs Page

| | Dialog (Variant A) | Page (Variant B) |
|---|---|---|
| **เหมาะกับ** | Form ง่าย fields น้อย (Unit, Status) | Form ซับซ้อน fields เยอะ มี tabs/sections |
| **Add** | เปิด Dialog ใน list page เดิม | Navigate ไป `/{module}/new` |
| **Edit** | เปิด Dialog พร้อม prefill data | Navigate ไป `/{module}/[id]` |
| **UX** | ไม่ออกจากหน้า list เร็วกว่า | เต็มจอ เหมาะกับ form ใหญ่ |

---

## File Structure

### Variant A: Dialog-based

```
app/(root)/config/{module}/
├── page.tsx                          # List page
└── _components/
    ├── {module}-component.tsx        # List + dialogs
    └── use-{module}-table.tsx        # Table columns + useReactTable

hooks/
└── use-{module}.ts                   # useQuery + mutations

components/share/
└── {module}-dialog.tsx               # Create/Edit dialog

types/
└── {module}.ts                       # TypeScript interface
```

### Variant B: Page-based

```
app/(root)/config/{module}/
├── page.tsx                          # List page
├── new/
│   └── page.tsx                      # Create page
├── [id]/
│   └── page.tsx                      # Edit page
└── _components/
    ├── {module}-component.tsx        # List only (no dialog state)
    ├── {module}-form.tsx             # Shared form (used by both new + [id])
    └── use-{module}-table.tsx        # Table columns + useReactTable

hooks/
└── use-{module}.ts                   # useQuery + useQueryById + mutations

types/
└── {module}.ts                       # TypeScript interface
```

---

## Code Templates

### 1. Type Definition — `types/{module}.ts`

```ts
export interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. API Endpoint — `constant/api-endpoints.ts`

```ts
export const API_ENDPOINTS = {
  // ... existing
  CATEGORIES: (buCode: string) => `/api/proxy/api/config/${buCode}/categories`,
} as const;
```

### 3. Hooks — `hooks/use-{module}.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { Category } from "@/types/category";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface CategoryResponse {
  data: Category[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

// --- List query ---
export function useCategory(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<CategoryResponse>({
    queryKey: ["categories", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.CATEGORIES(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: !!buCode,
  });
}

// --- Single item query (Variant B only) ---
export function useCategoryById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<Category>({
    queryKey: ["categories", buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(`${API_ENDPOINTS.CATEGORIES(buCode)}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

// --- Mutations ---
export interface CreateCategoryDto {
  name: string;
  description: string;
  is_active: boolean;
}

export function useCreateCategory() {
  return useApiMutation<CreateCategoryDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.CATEGORIES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["categories"],
    errorMessage: "Failed to create category",
  });
}

export function useDeleteCategory() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.CATEGORIES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["categories"],
    errorMessage: "Failed to delete category",
  });
}

export function useUpdateCategory() {
  return useApiMutation<CreateCategoryDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.CATEGORIES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["categories"],
    errorMessage: "Failed to update category",
  });
}
```

### 4. Table Hook — `_components/use-{module}-table.tsx`

```tsx
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import type { Category } from "@/types/category";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseCategoryTableOptions {
  categories: Category[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function useCategoryTable({
  categories,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseCategoryTableOptions) {
  "use no memo";

  const columns: ColumnDef<Category>[] = [
    {
      id: "select",
      header: () => (
        <div className="flex justify-center">
          <DataGridTableRowSelectAll />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataGridTableRowSelect row={row} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      id: "index",
      header: "#",
      cell: ({ row }) =>
        row.index +
        1 +
        ((Number(params.page) || 1) - 1) * (Number(params.perpage) || 10),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("name")}
        </button>
      ),
    },
    // ... เพิ่ม columns ตามที่ user ระบุ
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Status"
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <Badge
          size="sm"
          variant={row.getValue("is_active") ? "success" : "destructive"}
        >
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 100,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
      },
    },
    {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <DataGridRowActions onDelete={() => onDelete(row.original)} />
      ),
      enableSorting: false,
      size: 40,
    },
  ];

  return useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
```

---

### Variant A: Dialog-based

#### A5. Dialog — `components/share/{module}-dialog.tsx`

```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-category";
import type { Category } from "@/types/category";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly category?: Category | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isEdit = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", is_active: true },
  });

  const onSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      description: values.description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      updateCategory.mutate(
        { id: category.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Category updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success("Category created successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const getButtonLabel = () => {
    if (isPending) return isEdit ? "Saving..." : "Creating...";
    return isEdit ? "Save" : "Create";
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent
        className="sm:max-w-sm gap-3 p-4"
        onOpenAutoFocus={() =>
          form.reset(
            category
              ? {
                  name: category.name,
                  description: category.description,
                  is_active: category.is_active,
                }
              : { name: "", description: "", is_active: true },
          )
        }
      >
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">
            {isEdit ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="category-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="category-name"
                placeholder="e.g. Electronics"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("name")}
              />
              <FieldError>
                {form.formState.errors.name?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="category-description" className="text-xs">
                Description
              </FieldLabel>
              <Textarea
                id="category-description"
                placeholder="Optional"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("description")}
              />
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="category-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="category-is-active" className="text-xs">
                Active
              </FieldLabel>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {getButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

#### A6. Main Component — `_components/{module}-component.tsx`

```tsx
"use client";

import { useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCategory, useDeleteCategory } from "@/hooks/use-category";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Category } from "@/types/category";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import { CategoryDialog } from "@/components/share/category-dialog";
import DisplayTemplate from "@/components/display-template";
import { useCategoryTable } from "./use-category-table";

export default function CategoryComponent() {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const deleteCategory = useDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useCategory(params);

  const categories = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useCategoryTable({
    categories,
    totalRecords,
    params,
    tableConfig,
    onEdit: (category) => {
      setEditCategory(category);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Category"
      description="Manage categories for your inventory."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="xs"
            onClick={() => {
              setEditCategory(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Category
          </Button>
          <Button size="xs" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="xs" variant="outline">
            <Printer />
            Print
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

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editCategory}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteCategory.isPending && setDeleteTarget(null)
        }
        title="Delete Category"
        description={`Are you sure you want to delete category "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteCategory.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCategory.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Category deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
```

#### A7. Page — `app/(root)/config/{module}/page.tsx`

```tsx
import CategoryComponent from "./_components/category-component";

export default function CategoryPage() {
  return <CategoryComponent />;
}
```

---

### Variant B: Page-based

#### B5. Shared Form — `_components/{module}-form.tsx`

```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-category";
import type { Category } from "@/types/category";
import DisplayTemplate from "@/components/display-template";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  readonly category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description,
          is_active: category.is_active,
        }
      : { name: "", description: "", is_active: true },
  });

  const onSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      description: values.description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      updateCategory.mutate(
        { id: category.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Category updated successfully");
            router.push("/config/category");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success("Category created successfully");
          router.push("/config/category");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <DisplayTemplate
      title={isEdit ? "Edit Category" : "Add Category"}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => router.push("/config/category")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="xs"
            form="category-form"
            disabled={isPending}
          >
            {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save" : "Create")}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="category-name" className="text-xs">
              Name
            </FieldLabel>
            <Input
              id="category-name"
              placeholder="e.g. Electronics"
              className="h-8 text-sm"
              disabled={isPending}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="category-description" className="text-xs">
              Description
            </FieldLabel>
            <Textarea
              id="category-description"
              placeholder="Optional"
              className="text-sm"
              disabled={isPending}
              {...form.register("description")}
            />
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="category-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
            <FieldLabel htmlFor="category-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </DisplayTemplate>
  );
}
```

#### B6. Main Component (List only) — `_components/{module}-component.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCategory, useDeleteCategory } from "@/hooks/use-category";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Category } from "@/types/category";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useCategoryTable } from "./use-category-table";

export default function CategoryComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const deleteCategory = useDeleteCategory();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useCategory(params);

  const categories = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useCategoryTable({
    categories,
    totalRecords,
    params,
    tableConfig,
    onEdit: (category) => router.push(`/config/category/${category.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Category"
      description="Manage categories for your inventory."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="xs"
            onClick={() => router.push("/config/category/new")}
          >
            <Plus />
            Add Category
          </Button>
          <Button size="xs" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="xs" variant="outline">
            <Printer />
            Print
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
          !open && !deleteCategory.isPending && setDeleteTarget(null)
        }
        title="Delete Category"
        description={`Are you sure you want to delete category "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteCategory.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCategory.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Category deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
```

#### B7. Pages

**List page** — `app/(root)/config/{module}/page.tsx`

```tsx
import CategoryComponent from "./_components/category-component";

export default function CategoryPage() {
  return <CategoryComponent />;
}
```

**Create page** — `app/(root)/config/{module}/new/page.tsx`

```tsx
import { CategoryForm } from "../_components/category-form";

export default function NewCategoryPage() {
  return <CategoryForm />;
}
```

**Edit page** — `app/(root)/config/{module}/[id]/page.tsx`

```tsx
"use client";

import { use } from "react";
import { useCategoryById } from "@/hooks/use-category";
import { CategoryForm } from "../_components/category-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: category, isLoading, error, refetch } = useCategoryById(id);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!category) return <ErrorState message="Category not found" />;

  return <CategoryForm category={category} />;
}
```

---

## Shared Dependencies (มีอยู่แล้ว ไม่ต้องสร้างใหม่)

| File | Purpose |
|------|---------|
| `hooks/use-api-mutation.ts` | Generic mutation helper (buCode, error handling, invalidation) |
| `hooks/use-data-grid-state.ts` | Pagination, sorting, search, filter state via URL params |
| `hooks/use-list-page-state.ts` | URL-based state (resets page on search/filter change) |
| `hooks/use-profile.ts` | User profile + buCode |
| `components/display-template.tsx` | Page layout (title, toolbar, actions, children) |
| `components/search-input.tsx` | Search input with Enter key + clear button |
| `components/ui/status-filter.tsx` | Active/Inactive filter dropdown |
| `components/ui/delete-dialog.tsx` | Confirmation dialog with isPending support |
| `components/ui/error-state.tsx` | Error display with retry button |
| `components/reui/data-grid/*` | DataGrid, DataGridTable, DataGridPagination, etc. |
| `utils/build-query-string.ts` | URL query string builder |
| `types/params.ts` | ParamsDto interface |
| `constant/api-endpoints.ts` | API endpoint constants |

## Key Patterns

- **Dialog close prevention** (Variant A): `onOpenChange={isPending ? undefined : onOpenChange}`
- **DeleteDialog close prevention**: `!open && !isPending && setTarget(null)` + `e.preventDefault()`
- **Form reset on dialog open** (Variant A): ใช้ `onOpenAutoFocus` ของ DialogContent
- **Navigate back on success** (Variant B): `router.push("/config/{module}")` หลัง mutation สำเร็จ
- **React Compiler**: ใส่ `"use no memo"` ใน function body ของ table hook ที่ใช้ useReactTable
- **Dense DataGrid**: `tableLayout={{ dense: true }}` + `tableClassNames={{ base: "text-xs" }}`
- **Query invalidation**: ใช้ `invalidateKeys` ใน useApiMutation
- **Next.js 15 params** (Variant B): `params` เป็น `Promise` ใช้ `use(params)` เพื่อ unwrap
