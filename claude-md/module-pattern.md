# Config Module Pattern

Pattern สำหรับสร้าง CRUD module ใหม่ภายใต้ `app/(root)/config/`

---

## Instruction for Claude

เมื่อ user ต้องการสร้าง config module ใหม่ **ต้องถามคำถามเหล่านี้ก่อนเริ่มทำ** โดยใช้ AskUserQuestion tool:

### คำถามที่ต้องถาม

1. **Module name** — ชื่อ module (ภาษาอังกฤษ, singular) เช่น `category`, `warehouse`, `supplier`
2. **API path** — path ของ API endpoint เช่น `/api/proxy/api/config/{buCode}/categories`
3. **Form mode** — เปิด form แบบไหน
   - **Dialog** — form ง่าย fields น้อย เปิด dialog ใน list page (เช่น Currency)
   - **Page** — form ซับซ้อน fields เยอะ navigate ไป `/new` และ `/[id]` (เช่น Adjustment Type)
4. **Fields** — มี field อะไรบ้างใน form (ชื่อ field, type, required หรือไม่, placeholder)
5. **Table columns** — อยากแสดง column อะไรบ้างใน list (ชื่อ column, sortable หรือไม่) — column `select`, `#`, `status`, `action` มีอยู่แล้วจาก `useConfigTable`
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
5. แสดง column อะไรบ้างใน table? (select, #, status, action มีให้อยู่แล้ว)
   ตัวอย่าง:
   - code (sortable, clickable, size: 120)
   - name (sortable)
6. Page title & description?
   ตัวอย่าง: title="Category", description="Manage categories for your inventory."
```

### หลังจากได้คำตอบแล้ว

1. สร้างไฟล์ตาม file structure ของ variant ที่เลือก (Dialog หรือ Page)
2. เพิ่ม API endpoint ที่ `constant/api-endpoints.ts`
3. เพิ่ม query key ที่ `constant/query-keys.ts`
4. ใช้ code template ด้านล่างเป็น reference
5. ปรับ fields, columns, types ตามคำตอบ

---

## Form Mode: Dialog vs Page

| | Dialog (Variant A) | Page (Variant B) |
|---|---|---|
| **เหมาะกับ** | Form ง่าย fields น้อย (Currency, Unit) | Form ซับซ้อน fields เยอะ มี tabs/sections (Adjustment Type) |
| **Add** | เปิด Dialog ใน list page เดิม | Navigate ไป `/{module}/new` → mode = **add** |
| **Edit** | เปิด Dialog พร้อม prefill data | Navigate ไป `/{module}/[id]` → mode = **view** → กด Edit → mode = **edit** |
| **UX** | ไม่ออกจากหน้า list เร็วกว่า | เต็มจอ เหมาะกับ form ใหญ่ |

### Form Mode (Variant B only)

Variant B มี 3 mode:

| Mode | เข้าผ่าน | Form state | Actions |
|------|----------|------------|---------|
| **add** | `/{module}/new` | enabled ทุก field | Cancel (กลับ list), Create |
| **view** | `/{module}/[id]` | disabled ทุก field | Edit (เปลี่ยนเป็น edit mode) |
| **edit** | กดปุ่ม Edit ใน view | enabled ทุก field | Cancel (reset form กลับ view), Save, Delete (destructive) |

- `/[id]` เปิดมาจะเป็น **view mode** เสมอ — form disabled ดูข้อมูลได้อย่างเดียว
- กด **Edit** → เปลี่ยนเป็น **edit mode** — form enabled แก้ไขได้
- กด **Cancel** ตอน edit → reset form กลับค่าเดิม แล้วกลับเป็น **view mode**
- กด **Cancel** ตอน add → กลับไปหน้า list

---

## File Structure

### Variant A: Dialog-based

```
app/(root)/config/{module}/
├── page.tsx                          # List page
└── _components/
    ├── {module}-component.tsx        # List + dialog state
    ├── {module}-dialog.tsx           # Create/Edit dialog (อยู่ใน _components)
    └── use-{module}-table.tsx        # Table columns (เฉพาะ custom columns)

hooks/
└── use-{module}.ts                   # createConfigCrud + DTO

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
    └── use-{module}-table.tsx        # Table columns (เฉพาะ custom columns)

hooks/
└── use-{module}.ts                   # createConfigCrud + DTO

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

เพิ่ม entry ใน object:

```ts
export const API_ENDPOINTS = {
  // ... existing
  CATEGORIES: (buCode: string) => `/api/proxy/api/config/${buCode}/categories`,
} as const;
```

### 3. Query Key — `constant/query-keys.ts`

เพิ่ม entry ใน object:

```ts
export const QUERY_KEYS = {
  // ... existing
  CATEGORIES: "categories",
} as const;
```

### 4. Hooks — `hooks/use-{module}.ts`

ใช้ `createConfigCrud` factory — **ไม่ต้องเขียน useQuery/useMutation เอง**:

```ts
import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Category } from "@/types/category";

export interface CreateCategoryDto {
  name: string;
  description: string;
  is_active: boolean;
}

const crud = createConfigCrud<Category, CreateCategoryDto>({
  queryKey: QUERY_KEYS.CATEGORIES,
  endpoint: API_ENDPOINTS.CATEGORIES,
  label: "category",
});

export const useCategory = crud.useList;
export const useCategoryById = crud.useById;
export const useCreateCategory = crud.useCreate;
export const useUpdateCategory = crud.useUpdate;
export const useDeleteCategory = crud.useDelete;
```

### 5. Table Hook — `_components/use-{module}-table.tsx`

ใช้ `useConfigTable` helper — column `select`, `#`, `status`, `action` มีให้อยู่แล้ว เขียนแค่ custom columns:

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
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
  const columns: ColumnDef<Category>[] = [
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
    // ... เพิ่ม custom columns ตามที่ user ระบุ
  ];

  return useConfigTable<Category>({
    data: categories,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
```

> **หมายเหตุ**: `useConfigTable` จะเพิ่ม column `select`, `#` (index), `status` (is_active badge), `action` (delete button) ให้อัตโนมัติ ดังนั้นเขียนแค่ columns ที่เป็น data จริงๆ

---

### Variant A: Dialog-based

#### A6. Dialog — `_components/{module}-dialog.tsx`

```tsx
"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (open) {
      form.reset(
        category
          ? {
              name: category.name,
              description: category.description,
              is_active: category.is_active,
            }
          : { name: "", description: "", is_active: true },
      );
    }
  }, [open, category, form]);

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
      <DialogContent className="sm:max-w-sm gap-3 p-4">
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

#### A7. Main Component — `_components/{module}-component.tsx`

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
import { CategoryDialog } from "./category-dialog";
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
            size="sm"
            onClick={() => {
              setEditCategory(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Category
          </Button>
          <Button size="sm" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline">
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

#### A8. Page — `app/(root)/config/{module}/page.tsx`

```tsx
import CategoryComponent from "./_components/category-component";

export default function CategoryPage() {
  return <CategoryComponent />;
}
```

---

### Variant B: Page-based

#### B6. Shared Form — `_components/{module}-form.tsx`

มี 3 mode: **add** (จาก `/new`), **view** (จาก `/[id]` เริ่มต้น disabled), **edit** (กด Edit ใน view)

```tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-category";
import type { Category } from "@/types/category";
import type { FormMode } from "@/types/form";
import DisplayTemplate from "@/components/display-template";
import { DeleteDialog } from "@/components/ui/delete-dialog";

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
  const [mode, setMode] = useState<FormMode>(category ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createCategory.isPending || updateCategory.isPending;
  const isDisabled = isView || isPending;

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

    if (isEdit && category) {
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
    } else if (isAdd) {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success("Category created successfully");
          router.push("/config/category");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && category) {
      // Edit mode → reset form กลับค่าเดิม แล้วกลับเป็น view
      form.reset({
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
      setMode("view");
    } else {
      // Add mode → กลับไปหน้า list
      router.push("/config/category");
    }
  };

  const title = isAdd
    ? "Add Category"
    : isEdit
      ? "Edit Category"
      : "Category";

  return (
    <DisplayTemplate
      title={title}
      actions={
        <>
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="category-form"
                disabled={isPending}
              >
                {isPending
                  ? isEdit ? "Saving..." : "Creating..."
                  : isEdit ? "Save" : "Create"}
              </Button>
            </>
          )}
          {isEdit && category && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteCategory.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
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
              disabled={isDisabled}
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
              disabled={isDisabled}
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
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="category-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>

      {category && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteCategory.isPending && setShowDelete(false)
          }
          title="Delete Category"
          description={`Are you sure you want to delete category "${category.name}"? This action cannot be undone.`}
          isPending={deleteCategory.isPending}
          onConfirm={() => {
            deleteCategory.mutate(category.id, {
              onSuccess: () => {
                toast.success("Category deleted successfully");
                router.push("/config/category");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </DisplayTemplate>
  );
}
```

#### B7. Main Component (List only) — `_components/{module}-component.tsx`

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
            size="sm"
            onClick={() => router.push("/config/category/new")}
          >
            <Plus />
            Add Category
          </Button>
          <Button size="sm" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline">
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

#### B8. Pages

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

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!category) return <ErrorState message="Category not found" />;

  return <CategoryForm category={category} />;
}
```

---

## Shared Dependencies (มีอยู่แล้ว ไม่ต้องสร้างใหม่)

| File | Purpose |
|------|---------|
| `hooks/use-config-crud.ts` | Factory function สร้าง CRUD hooks (useList, useById, useCreate, useUpdate, useDelete) |
| `hooks/use-api-mutation.ts` | Generic mutation helper (buCode, error handling, invalidation) |
| `hooks/use-data-grid-state.ts` | Pagination, sorting, search, filter state via URL params |
| `hooks/use-profile.ts` | User profile + buCode |
| `lib/data-grid/use-config-table.ts` | Shared table helper — เพิ่ม select, index, status, action columns อัตโนมัติ |
| `lib/data-grid/columns.tsx` | Shared column definitions (selectColumn, indexColumn, statusColumn, actionColumn) |
| `lib/http-client.ts` | HTTP client wrapper (get, post, put, patch, delete) |
| `components/display-template.tsx` | Page layout (title, description, toolbar, actions, children) |
| `components/search-input.tsx` | Search input with Enter key + clear button |
| `components/ui/status-filter.tsx` | Active/Inactive filter dropdown |
| `components/ui/delete-dialog.tsx` | Confirmation dialog with isPending support |
| `components/ui/error-state.tsx` | Error display with retry button |
| `components/ui/field.tsx` | Field, FieldGroup, FieldLabel, FieldError components |
| `components/reui/data-grid/*` | DataGrid, DataGridTable, DataGridPagination, DataGridColumnHeader, etc. |
| `utils/build-query-string.ts` | URL query string builder |
| `types/params.ts` | ParamsDto interface |
| `types/form.ts` | `FormMode` type (`"add" \| "view" \| "edit"`) สำหรับ Variant B |
| `constant/api-endpoints.ts` | API endpoint constants |
| `constant/query-keys.ts` | Centralized query key registry |

## Key Patterns

- **CRUD hook factory**: ใช้ `createConfigCrud<T, TCreate>()` แทนการเขียน hooks เอง — ให้ `queryKey`, `endpoint`, `label`
- **HTTP client**: ใช้ `httpClient` จาก `@/lib/http-client` แทน raw `fetch`
- **Table columns**: ใช้ `useConfigTable<T>()` ที่มี select, index, status, action columns อยู่แล้ว — เขียนแค่ custom columns
- **Dialog form reset** (Variant A): ใช้ `useEffect` กับ `open` dependency เพื่อ reset form
- **Dialog close prevention** (Variant A): `onOpenChange={isPending ? undefined : onOpenChange}`
- **DeleteDialog close prevention**: `!open && !isPending && setTarget(null)`
- **View/Edit/Add mode** (Variant B): `/[id]` เริ่มเป็น view (disabled) → กด Edit → edit mode → Cancel reset กลับ view
- **Delete in form** (Variant B): แสดงปุ่ม Delete เฉพาะ **edit mode** (`variant="destructive"`) → เปิด `DeleteDialog` confirm → ลบแล้ว `router.push` กลับ list
- **Navigate back on success** (Variant B): `router.push("/config/{module}")` หลัง mutation สำเร็จ
- **React Compiler**: `"use no memo"` อยู่ใน `useConfigTable` แล้ว ไม่ต้องใส่เอง
- **Dense DataGrid**: `tableLayout={{ dense: true }}` + `tableClassNames={{ base: "text-xs" }}`
- **Query invalidation**: อัตโนมัติผ่าน `createConfigCrud` → `useApiMutation` → `invalidateKeys`
- **Next.js 15 params** (Variant B): `params` เป็น `Promise` ใช้ `use(params)` เพื่อ unwrap
