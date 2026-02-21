# Naming Convention

---

## File Naming (kebab-case ทั้งหมด)

| ที่อยู่ | Pattern | ตัวอย่าง |
|---------|---------|----------|
| `hooks/` | `use-{entity}.ts` | `use-vendor.ts`, `use-purchase-request.ts` |
| `types/` | `{entity}.ts` | `vendor.ts`, `purchase-request.ts` |
| `constant/` | `{name}.ts` | `api-endpoints.ts`, `query-keys.ts`, `purchase-request.ts` |
| `components/lookup/` | `lookup-{entity}.tsx` | `lookup-vendor.tsx`, `lookup-currency.tsx` |
| `components/ui/` | `{component}.tsx` | `button.tsx`, `dialog.tsx`, `form-toolbar.tsx` |

### Page Component Files (`_components/`)

ใช้ prefix ย่อของ module:

| Module | Prefix | ตัวอย่างไฟล์ |
|--------|--------|-------------|
| Purchase Request | `pr-` | `pr-form.tsx`, `pr-item-table.tsx`, `pr-form-schema.ts` |
| Purchase Order | `po-` | `po-form.tsx`, `po-item-table.tsx` |
| Credit Note | `cn-` | `cn-form.tsx`, `cn-item-table.tsx` |
| Goods Receive Note | `grn-` | `grn-form.tsx`, `grn-item-table.tsx` |
| Request Price List | `rpl-` | `rpl-form.tsx`, `vendor-tab.tsx` |
| Purchase Request Template | `prt-` | `prt-form.tsx` |
| Physical Count | `pc-` | `pc-form-schema.ts` |
| Spot Check | `sc-` | `sc-form-schema.ts` |
| Period End | `pe-` | `pe-form-schema.ts` |
| Inventory Adjustment | `ia-` | `ia-schema.ts` |

### File Types

| Type | Pattern | ตัวอย่าง |
|------|---------|----------|
| Form component | `{prefix}-form.tsx` | `pr-form.tsx` |
| Form schema | `{prefix}-form-schema.ts` | `pr-form-schema.ts` |
| Item table hook | `{prefix}-item-table.tsx` | `pr-item-table.tsx` |
| List component | `{module}-component.tsx` | `vendor-component.tsx` |
| Dialog | `{module}-dialog.tsx` | `currency-dialog.tsx` |
| Table hook | `use-{module}-table.tsx` | `use-vendor-table.tsx` |
| General fields | `{prefix}-general-fields.tsx` | `po-general-fields.tsx` |

---

## Component & Function Naming (PascalCase)

```tsx
// Named export (standard)
export function LookupVendor({ ... }: LookupVendorProps) { }
export function CategoryDialog({ ... }: CategoryDialogProps) { }

// Default export (list component, page)
export default function CategoryComponent() { }
export default function CategoryPage() { }
```

---

## Hook Naming (camelCase, prefix `use`)

```ts
// CRUD hooks (จาก createConfigCrud)
export const useVendor = crud.useList;        // useEntity
export const useVendorById = crud.useById;    // useEntityById
export const useCreateVendor = crud.useCreate; // useCreateEntity
export const useUpdateVendor = crud.useUpdate; // useUpdateEntity
export const useDeleteVendor = crud.useDelete; // useDeleteEntity
```

---

## Type & Interface Naming (PascalCase)

| ประเภท | Pattern | ตัวอย่าง |
|--------|---------|----------|
| Entity | `{Entity}` | `Vendor`, `PurchaseRequest` |
| Detail/Child | `{Entity}{Child}` | `VendorAddress`, `VendorContact` |
| Create DTO | `Create{Entity}Dto` | `CreateVendorDto`, `CreatePurchaseRequestDto` |
| Payload | `{Entity}Payload` | `PurchaseRequestDetailPayload` |
| Form values | `{Prefix}FormValues` | `PrFormValues`, `CnFormValues`, `RfpFormValues` |
| Props | `{Component}Props` | `LookupVendorProps`, `PrActionDialogProps` |
| Status union | `{Entity}Status` | `PurchaseRequestStatus` |

---

## Constant Naming (UPPER_SNAKE_CASE)

### API Endpoints

```ts
export const API_ENDPOINTS = {
  VENDORS: (buCode: string) => `/api/proxy/api/config/${buCode}/vendors`,
  PURCHASE_REQUEST: (buCode: string) => `/api/proxy/api/${buCode}/purchase-request`,
} as const;
```

### Query Keys

```ts
export const QUERY_KEYS = {
  VENDORS: "vendors",
  PURCHASE_REQUESTS: "purchase-requests",
} as const;
```

### Status Config

```ts
export const PR_STATUS_CONFIG: Record<string, { variant: BadgeVariant; label: string }> = {
  draft: { variant: "secondary", label: "DRAFT" },
  submitted: { variant: "info", label: "SUBMITTED" },
  approved: { variant: "success", label: "APPROVED" },
};
```

### Empty Form / Item Constants

```ts
export const EMPTY_FORM: PrFormValues = { ... };
export const PR_ITEM: PrFormValues["items"][number] = { ... };
```

---

## Zod Schema Naming (camelCase)

```ts
export const detailSchema = z.object({ ... }); // child schema
export const prSchema = z.object({ ... });      // main schema
```

---

## Variable Naming

### Boolean (prefix `is`, `has`, `can`)

```ts
// API fields → snake_case
is_active: boolean
is_primary: boolean

// Component variables → camelCase
const isPending = createMutation.isPending || updateMutation.isPending;
const isDisabled = isView || isPending;
const isView = mode === "view";
const isEdit = mode === "edit";
const isAdd = mode === "add";
```

### State + Handler

```ts
// useState — noun + setNoun
const [mode, setMode] = useState<FormMode>("view");
const [showDelete, setShowDelete] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);

// handler — handleVerb / handleVerbNoun
const handleCancel = () => { };
const handleAddItem = () => { };
const handleDeleteItem = (index: number) => { };
const handleBulkApprove = () => { };
```

### API fields vs JS variables

```ts
// API (snake_case) → JS (camelCase)
bu_code → buCode
purchase_request_id → purchaseRequestId
// ยกเว้น: form values ใช้ snake_case ตรงกับ API เพื่อไม่ต้อง map
```

> **สำคัญ**: Form values ใช้ **snake_case** ตรงกับ API field names เลย (เช่น `product_id`, `vendor_name`, `is_active`) เพื่อลด mapping
