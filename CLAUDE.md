# Carmen Inventory Frontend

ERP inventory management system — compact, dense UI for users who need maximum data visibility.

## ภาษาในการสื่อสาร

สื่อสารกับ user เป็น **ภาษาไทย** เสมอ (ยกเว้น code, commit message, PR ใช้ภาษาอังกฤษ)

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **React**: 19.2.3 with React Compiler
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Forms**: react-hook-form 7 + zod 4 + @hookform/resolvers
- **Data**: TanStack React Query 5 + TanStack React Table 8
- **Testing**: Vitest + Testing Library
- **Runtime**: Bun (use `bun` instead of `npm`/`npx` for all commands)
- **Icons**: lucide-react

## Commands

```bash
bun dev              # Dev server (Turbopack)
bun run build        # Production build
bun run lint         # ESLint
bun test             # Vitest watch
bun test:run         # Vitest single run
bun add <pkg>        # Install dependency
```

## Project Structure

```text
app/(root)/           # Pages grouped by domain
  config/             # Currency, Unit, Location, Department, TaxProfile, etc.
  procurement/        # PurchaseOrder, CreditNote
  product-management/ # Category, Product
  inventory-management/ # Adjustment, PhysicalCount, PeriodEnd, SpotCheck
  store-operation/    # StoreRequisition
  vendor-management/  # Vendor
  system-admin/       # Roles, Users
  dashboard/

hooks/                # use-{entity}.ts — CRUD hooks via createConfigCrud
types/                # {entity}.ts — TypeScript interfaces
constant/             # api-endpoints.ts, query-keys.ts, module-specific constants
components/
  ui/                 # Shared UI (shadcn-based), data-grid/, field.tsx, delete-dialog.tsx
  lookup/             # lookup-{entity}.tsx — searchable dropdowns
  display-template.tsx # Page layout (title, description, toolbar, actions, children)
  search-input.tsx
  empty-component.tsx
lib/
  http-client.ts      # HTTP wrapper + client-side rate limiting
  api-error.ts        # ApiError class with structured error codes
  api-schemas.ts      # Zod response schemas
  cache-config.ts     # CACHE_STATIC / CACHE_NORMAL / CACHE_DYNAMIC / CACHE_PROFILE
  rate-limit.ts       # Server-side token bucket rate limiter
  cookies.ts          # Cookie config (httpOnly, secure, sameSite=strict)
  env.ts              # requireEnv() validation
  date-utils.ts       # isoToDateInput, date formatting
  currency-utils.ts   # Currency formatting helpers
```

---

## 1. Architecture

### State Management — URL is the source of truth

List page state (search, filter, sort, page, perpage) lives in URL query params, not React state:

```text
useURL → useListPageState → useDataGridState → DataGrid
```

- `useURL` uses `useSyncExternalStore` + `history.replaceState` (not push) + custom event for reactivity
- Page resets to 1 when search/filter changes
- `params` object is passed directly to API hooks

### API Proxy

All API calls go through `/api/proxy/[...path]` server-side route:

- Client calls `/api/proxy/api/config/BU001/vendors`
- Proxy forwards to `BACKEND_URL/api/config/BU001/vendors`
- Auto-refreshes access token on 401 (client is unaware)
- All API functions require `buCode` as first parameter

### API Response Format

```ts
{ data: T[], paginate: { total: number, page: number, perpage: number, pages: number } }
```

### Cache Strategy

Use the appropriate cache profile from `lib/cache-config.ts`:

| Profile | staleTime | gcTime | Use for |
| --- | --- | --- | --- |
| `CACHE_STATIC` | 30 min | 60 min | Config, units, locations, permissions |
| `CACHE_NORMAL` | 5 min | 10 min | Vendor list, product catalog |
| `CACHE_DYNAMIC` | 1 min | 5 min | PRs, POs, approvals |
| `CACHE_PROFILE` | Infinity | — | User profile |

QueryClient defaults: `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 5min`, `gcTime: 10min`

---

## 2. Naming Conventions

### File Naming (kebab-case)

| Location | Pattern | Example |
| --- | --- | --- |
| `hooks/` | `use-{entity}.ts` | `use-vendor.ts`, `use-purchase-order.ts` |
| `types/` | `{entity}.ts` | `vendor.ts`, `purchase-request.ts` |
| `constant/` | `{name}.ts` | `api-endpoints.ts`, `query-keys.ts` |
| `components/lookup/` | `lookup-{entity}.tsx` | `lookup-vendor.tsx`, `lookup-currency.tsx` |
| `components/ui/` | `{component}.tsx` | `button.tsx`, `delete-dialog.tsx` |

### Page Component Files (`_components/`)

Use module abbreviation prefix:

| Module | Prefix | Examples |
| --- | --- | --- |
| Purchase Request | `pr-` | `pr-form.tsx`, `pr-item-table.tsx`, `pr-form-schema.ts` |
| Purchase Order | `po-` | `po-form.tsx`, `po-item-fields.tsx`, `po-general-fields.tsx` |
| Credit Note | `cn-` | `cn-form.tsx`, `cn-item-table.tsx` |
| Goods Receive Note | `grn-` | `grn-form.tsx` |
| Store Requisition | `sr-` | `sr-form.tsx`, `sr-item-fields.tsx` |
| Physical Count | `pc-` | `pc-form.tsx`, `pc-form-schema.ts` |
| Spot Check | `sc-` | `sc-form-schema.ts` |
| Period End | `pe-` | `pe-form-schema.ts` |
| Inventory Adjustment | `ia-` | `ia-schema.ts` |
| Product | `pd-` | `pd-form.tsx`, `pd-general-tab.tsx` |

### File Types

| Type | Pattern | Example |
| --- | --- | --- |
| Form component | `{prefix}-form.tsx` | `po-form.tsx` |
| Form schema | `{prefix}-form-schema.ts` | `po-form-schema.ts` |
| Item fields | `{prefix}-item-fields.tsx` | `po-item-fields.tsx` |
| List component | `{module}-component.tsx` | `vendor-component.tsx` |
| Dialog | `{module}-dialog.tsx` | `currency-dialog.tsx` |
| Table hook | `use-{module}-table.tsx` | `use-po-table.tsx` |
| General fields | `{prefix}-general-fields.tsx` | `po-general-fields.tsx` |

### Code Naming

| What | Convention | Example |
| --- | --- | --- |
| Components | PascalCase | `LookupVendor`, `CategoryDialog` |
| Hooks | camelCase + `use` | `useVendor`, `useCreateVendor` |
| Types/Interfaces | PascalCase | `Vendor`, `CreateVendorDto`, `PrFormValues` |
| Props | `{Component}Props` | `LookupVendorProps` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS`, `QUERY_KEYS` |
| Form values | snake_case (match API) | `product_id`, `vendor_name`, `is_active` |
| Boolean vars | `is`/`has`/`can` prefix | `isPending`, `isDisabled`, `isView` |
| Handlers | `handle` + verb | `handleCancel`, `handleAddItem` |
| State | noun + setNoun | `const [mode, setMode] = useState()` |

---

## 3. Module Pattern — Creating New CRUD Modules

### When creating a new module, ask these questions first:

1. **Module name** — path e.g. `config/category`, `product-management/product`
2. **API path** — e.g. `/api/proxy/api/config/{buCode}/categories`
3. **Form mode** — Dialog (simple, few fields) or Page (complex, many fields, navigate to `/new` and `/[id]`)
4. **Fields** — field name, type, required, placeholder
5. **Table columns** — column name, sortable (select, #, status, action are automatic)
6. **Page title & description**

### Dialog vs Page

| Aspect | Dialog | Page |
| --- | --- | --- |
| Suitable for | Few fields, quick edit | Complex forms, tabs, sections |
| Add | Open dialog on list page | Navigate to `/{module}/new` |
| Edit | Open dialog with prefilled data | Navigate to `/{module}/[id]` → view → edit |
| Routes | Single route | 3 routes (list, new, [id]) |

### File Structure — Dialog-based

```text
app/(root)/{basePath}/{module}/
├── page.tsx
└── _components/
    ├── {module}-component.tsx    # List + dialog state
    ├── {module}-dialog.tsx       # Create/Edit dialog
    └── use-{module}-table.tsx    # Custom columns only

hooks/use-{module}.ts             # createConfigCrud
types/{module}.ts                 # Interface
```

### File Structure — Page-based

```text
app/(root)/{basePath}/{module}/
├── page.tsx
├── new/page.tsx
├── [id]/page.tsx
└── _components/
    ├── {module}-component.tsx    # List only
    ├── {module}-form.tsx         # Shared form (add/view/edit)
    └── use-{module}-table.tsx    # Custom columns only

hooks/use-{module}.ts             # createConfigCrud
types/{module}.ts                 # Interface
```

### Page Form Modes (Page-based only)

| Mode | Entry | Form state | Actions |
| --- | --- | --- | --- |
| `add` | `/{module}/new` | enabled | Cancel (back to list), Create |
| `view` | `/{module}/[id]` | disabled | Edit button |
| `edit` | Click Edit in view | enabled | Cancel (reset → view), Save, Delete |

### CRUD Hook Pattern

Use `createConfigCrud` factory — never write useQuery/useMutation manually for config entities:

```ts
import { createConfigCrud } from "@/hooks/use-config-crud";

const crud = createConfigCrud<Entity, CreateEntityDto>({
  queryKey: QUERY_KEYS.ENTITIES,
  endpoint: API_ENDPOINTS.ENTITIES,
  label: "entity",
  updateMethod: "PATCH", // optional, default "PUT"
});

export const useEntity = crud.useList;
export const useEntityById = crud.useById;
export const useCreateEntity = crud.useCreate;
export const useUpdateEntity = crud.useUpdate;
export const useDeleteEntity = crud.useDelete;
```

### Table Hook Pattern

`useConfigTable` auto-adds columns: select, index (#), status (is_active badge), action (delete). Write only custom data columns:

```tsx
export function useEntityTable({ entities, totalRecords, params, tableConfig, onEdit, onDelete }) {
  const columns: ColumnDef<Entity>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>{row.getValue("name")}</CellAction>
      ),
    },
  ];

  return useConfigTable<Entity>({ data: entities, columns, totalRecords, params, tableConfig, onDelete });
}
```

### Key Module Patterns

- `DisplayTemplate` — used only for list pages (title, description, toolbar, actions)
- Page-based forms do NOT use `DisplayTemplate` — use `div` + flex layout with `ArrowLeft` back button
- Mode labels: use `getModeLabels(mode, "Entity")` from `@/types/form`
- Delete: always use `DeleteDialog` component with `isPending` support
- Dialog close prevention: `onOpenChange={isPending ? undefined : onOpenChange}`
- Dialog form reset: `useEffect` on `open` dependency

---

## 4. Form & Validation

### Schema File — `_components/{prefix}-form-schema.ts`

Must export:

```ts
// 1. Zod schema
export const entitySchema = z.object({ ... });

// 2. Form values type
export type EntityFormValues = z.infer<typeof entitySchema>;

// 3. Empty form constant
export const EMPTY_FORM: EntityFormValues = { ... };
export const ENTITY_ITEM: EntityFormValues["items"][number] = { ... };

// 4. Helper functions
export function getDefaultValues(entity?: Entity): EntityFormValues { ... }
export function mapItemToPayload(item, index): Payload { ... }
```

### Zod Patterns

```ts
name: z.string().min(1, "Name is required"),           // Required string
description: z.string(),                                // Optional string (default "")
product_id: z.string().nullable().refine((v) => !!v, "Product is required"), // Nullable required
tax_profile_id: z.string().nullable().optional(),       // Nullable optional
requested_qty: z.coerce.number().min(1, "Min 1"),       // Number from input
is_active: z.boolean(),                                 // Boolean
credit_note_type: z.enum(["quantity_return", "amount_discount"]), // Enum
items: z.array(detailSchema),                           // Nested array
```

### Cross-field validation

```ts
export const schema = z.object({
  start_date: z.string().min(1),
  end_date: z.string().min(1),
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  { message: "End date must be after start date", path: ["end_date"] },
);
```

### zodResolver type assertion (required)

```ts
import { type Resolver } from "react-hook-form";
const form = useForm<FormValues>({
  resolver: zodResolver(schema) as Resolver<FormValues>,
  defaultValues,
});
```

### Form Submit — Add/Update/Remove Pattern (for line items)

```ts
const onSubmit = (values: FormValues) => {
  const newItems = values.items.filter((item) => !item.id);
  const existingItems = values.items.filter((item): item is typeof item & { id: string } => !!item.id);

  const currentIds = new Set(existingItems.map((item) => item.id));
  const removedItems = defaultValues.items
    .filter((item): item is typeof item & { id: string } => !!item.id && !currentIds.has(item.id))
    .map((item) => ({ id: item.id }));

  const updatedItems = existingItems.filter((item) => {
    const idx = values.items.findIndex((v) => v.id === item.id);
    const dirty = form.formState.dirtyFields.items?.[idx];
    return dirty != null && Object.keys(dirty).length > 0;
  });

  const details = {};
  if (newItems.length > 0) details.add = newItems.map(mapItemToPayload);
  if (updatedItems.length > 0) details.update = updatedItems.map((item, i) => ({ id: item.id, ...mapItemToPayload(item, i) }));
  if (removedItems.length > 0) details.remove = removedItems;
};
```

### useFieldArray

```ts
const { fields: itemFields, append, remove } = useFieldArray({ control: form.control, name: "items" });
const handleAddItem = () => append({ ...ENTITY_ITEM });
const handleDeleteItem = (index: number) => remove(index);
```

### maxLength — always set on text inputs

| Field type | maxLength |
| --- | --- |
| code | 10 |
| name / text input | 100 |
| Textarea (description, note) | 256 |

Component auto-displays char counter (e.g. `3/10`). Place `maxLength` before `{...form.register()}`.

---

## 5. Lookup Components

### 2 Types

| Type | Use when | Base |
| --- | --- | --- |
| Popover + Command | Many items, needs search | `LookupCombobox` |
| Select | Few items, no search needed | `Select` from shadcn |

### Standard Props

```ts
// Popover+Command (LookupCombobox wrappers)
interface LookupEntityProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  // Optional:
  readonly onItemChange?: (item: Entity) => void;    // Full object for setValue side effects
  readonly excludeIds?: Set<string>;                  // Prevent duplicate selection
  readonly defaultLabel?: string;                     // Fallback label
}

// Select type
interface LookupSelectProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly size?: "xs" | "sm" | "default";  // default: "sm"
}
```

### Data Fetching Pattern

```ts
const { data } = useEntity({ perpage: -1 });
const items = useMemo(() => data?.data?.filter((v) => v.is_active) ?? [], [data?.data]);
```

### Usage in Form

```tsx
<Field data-invalid={!!form.formState.errors.vendor_id}>
  <FieldLabel className="text-xs" required>Vendor</FieldLabel>
  <Controller
    control={form.control}
    name="vendor_id"
    render={({ field }) => (
      <LookupVendor value={field.value} onValueChange={field.onChange} disabled={disabled} />
    )}
  />
  <FieldError>{form.formState.errors.vendor_id?.message}</FieldError>
</Field>
```

### Cascading Lookup (parent → child)

```tsx
const WatchedProductUnit = memo(function WatchedProductUnit({ control, index, disabled }) {
  const productId = useWatch({ control, name: `items.${index}.product_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.order_unit_id`}
      render={({ field }) => (
        <LookupProductUnit productId={productId} value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled || !productId} />
      )}
    />
  );
});
```

### Side Effect Pattern (select → setValue other fields)

```tsx
<LookupCurrency
  value={field.value}
  onValueChange={field.onChange}
  onItemChange={(currency) => {
    form.setValue("currency_name", currency.code);
    form.setValue("exchange_rate", currency.exchange_rate);
  }}
/>
```

### Existing Lookups

**Popover+Command**: LookupVendor, LookupProduct, LookupLocation, LookupUnit, LookupDepartment, LookupItemGroup, LookupDeliveryPoint, LookupProductUnit, LookupProductInLocation, LookupGrn, LookupPriceList, LookupPrt, LookupBuType, LookupUser, LookupRecipeCategory, LookupCuisine

**Select**: LookupCurrency, LookupCurrencyIso, LookupCreditTerm, LookupCnReason, LookupTaxProfile, LookupWorkflow

### Styling

| Context | className |
| --- | --- |
| Form (standalone) | default |
| Table cell | `className="w-full text-[11px]"` |
| Select in table | `size="xs"` |

---

## 6. UI Guidelines — Compact ERP

### Spacing

| Level | Class |
| --- | --- |
| Page layout | `gap-4 p-3` |
| Page sections | `space-y-4` |
| Nested sections | `space-y-3` |
| Title to toolbar | `space-y-2` (DisplayTemplate) |
| Button groups | `gap-2` |
| Grid form | `grid-cols-2 gap-2` |

### Form

| Part | Class |
| --- | --- |
| FieldGroup (default) | `gap-7` |
| FieldGroup (compact) | `gap-3` |
| Input height | `h-8` (form), `h-7` (inline table), `h-6` (dense table) |
| Input text | `text-sm` |
| Label text | `text-xs` |

### Dialog

| Type | Class |
| --- | --- |
| Normal | `gap-4 p-6` |
| Compact (simple form) | `gap-3 p-4`, `sm:max-w-sm` |
| Title | `text-sm` |

### No Card — use spacing + section headers

```tsx
<div className="space-y-4">
  <section className="space-y-3">
    <h2 className="text-sm font-semibold">Section Name</h2>
    <FieldGroup className="gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field>...</Field>
      </div>
    </FieldGroup>
  </section>
</div>
```

### DataGrid / Table — Dense by default

```tsx
<DataGrid
  table={table}
  recordCount={totalRecords}
  isLoading={isLoading}
  tableLayout={{ dense: true }}
  tableClassNames={{ base: "text-xs" }}
>
  <DataGridContainer><DataGridTable /></DataGridContainer>
  <DataGridPagination />
</DataGrid>
```

- Empty state: always use `<EmptyComponent>` from `@/components/empty-component`
- Cell text: `text-xs` or `text-[11px]`
- Inline input in table: `h-6 text-[11px]` or `h-7 text-xs`

### Font Size

| Context | Size |
| --- | --- |
| Table cell / dense | `text-xs` or `text-[11px]` |
| Form label | `text-xs` |
| Form input | `text-sm` |
| Dialog title | `text-sm` |
| Page title | `text-lg font-semibold` |
| Page description | `text-sm text-muted-foreground` |

### Button Size

| Context | Size |
| --- | --- |
| Page actions | `sm` |
| Dialog submit/cancel | `sm` |
| Inline table action | `icon-xs` / `xs` |
| Toolbar back | `ghost` + `icon-sm` |

### Input Suffix (unit display)

```tsx
<div className="relative">
  <Input type="number" step="0.01" className="h-8 pr-12 text-right text-sm" {...form.register("field")} />
  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
</div>
```

### Table Expand Row

- Wrapper: `max-w-3xl` to constrain width
- Use fixed-width grid columns (e.g. `grid-cols-[14rem_5rem_10rem]`)
- Never use `ml-auto` — causes wide gaps

---

## 7. Error Handling

### ApiError Class (`lib/api-error.ts`)

```ts
class ApiError extends Error {
  constructor(code: ErrorCode, message: string, statusCode?: number, retryable?: boolean, details?: unknown)
  static fromResponse(res: Response, fallbackMessage: string): ApiError
}
```

Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_ERROR`, `NETWORK_ERROR`, `TIMEOUT`

- `retryable: true` only for 5xx errors
- Never throw plain `Error` for API failures — use `ApiError`

### In Mutations (`use-api-mutation.ts`)

```ts
if (!res.ok) {
  let serverMessage: string | undefined;
  try { serverMessage = (await res.json()).message; } catch {}
  throw ApiError.fromResponse(res, serverMessage || errorMessage);
}
```

Supports optimistic updates with automatic rollback on error.

### Error Boundaries

Per-module error boundaries at each route group (`app/(root)/{domain}/error.tsx`) using `ModuleError` component that maps error codes to human-readable messages.

---

## 8. Security

- **Never expose** `BACKEND_URL` to the client — all API calls go through `/api/proxy`
- **Never store tokens** in localStorage — cookies only (httpOnly, secure, sameSite=strict)
- **Never trust client input** in API routes — validate path, body size, content-type
- Access token: 15 min, Refresh token: 7 days
- Proxy validates: no path traversal (`..`, `//`), body < 1MB, 15s fetch timeout
- Rate limiting: client-side sliding window (50 req/10s), server-side token bucket (100 req/min per IP)
- Security headers on all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 9. Accessibility (a11y)

Target users are older adults — clarity and usability are critical. Radix UI (shadcn) provides baseline a11y, but custom components must follow these rules.

### Icon-only Buttons — always add `aria-label`

```tsx
// Bad — screen reader says nothing
<Button size="icon-xs" onClick={handleDelete}><Trash2 /></Button>

// Good
<Button size="icon-xs" onClick={handleDelete} aria-label="Delete"><Trash2 /></Button>
```

Common labels: `aria-label="Delete"`, `"Edit"`, `"Go back"`, `"Close"`, `"Add item"`, `"Remove row"`

### Form Labels — always pair `htmlFor` + `id`

```tsx
<FieldLabel htmlFor="vendor-name" className="text-xs" required>Name</FieldLabel>
<Input id="vendor-name" {...form.register("name")} />
```

- Every input/textarea/select must have a matching `id` + `htmlFor`
- Checkbox/Radio: wrap with `<FieldLabel>` or use `aria-label`

### Table Headers

```tsx
<th scope="col">Name</th>     // Always add scope="col"
```

### Decorative Icons — hide from screen readers

```tsx
// Icons next to text — decorative, hide them
<Button size="sm"><Plus aria-hidden="true" />Add Vendor</Button>

// Icon-only — NOT decorative, use aria-label on Button instead
<Button size="icon-xs" aria-label="Delete"><Trash2 /></Button>
```

### Keyboard Navigation

- All interactive elements must be focusable (buttons, links, inputs — native HTML handles this)
- Custom interactive components (`CellAction`, inline table cells) must use `<button>` or `role="button"` + `tabIndex={0}` + `onKeyDown` for Enter/Space
- Focus order must follow visual order (no `tabIndex` > 0)
- Dialog/Popover: Radix handles focus trap automatically — do not break it

### Focus Indicators

- Never remove `focus-visible:ring-*` — required for keyboard users
- Dense table inputs: ensure focus ring is visible despite compact sizing

### Loading & Dynamic Content

```tsx
// Announce loading state to screen readers
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading && <Spinner />}
  {!isLoading && <DataGridTable />}
</div>
```

- Use `aria-live="polite"` for content that updates (pagination, search results count)
- Use `aria-busy={true}` during loading

### Color & Contrast

- Never rely on color alone to convey meaning — always pair with text/icon
- Status badges: already have text labels (DRAFT, APPROVED) — good
- Error states: use both red color AND error icon/text
- `text-muted-foreground` is fine for descriptions but never for primary actions or required labels

### Semantic HTML

- Use `<nav>` for navigation, `<main>` for main content, `<section>` for page sections
- Use `<h1>`-`<h6>` in order — no skipping levels
- DataGrid: already uses `<table>` — do not replace with `<div>`
- Lists: use `<ul>`/`<ol>` for actual lists, not just `<div>` stacks

### Quick Checklist (apply to every component)

1. Can I use this with keyboard only? (Tab, Enter, Space, Escape)
2. Does every icon-only button have `aria-label`?
3. Does every form input have an associated label?
4. Is the focus indicator visible?
5. Does color convey meaning without text backup?

---

## 10. Performance & Code Quality

### React Compiler

- Active — avoid manual `useMemo`/`useCallback` unless necessary
- `"use no memo"` directive when component uses `useFieldArray` + dynamic `setValue` (auto-memoize causes stale closure)

### useWatch over form.watch

```tsx
// Good — re-renders only when this field changes
const value = useWatch({ control, name: `items.${i}.field` }) ?? "";

// Bad — re-renders on every form change
const value = form.watch(`items.${i}.field`);
```

### Computed values with useWatch

```tsx
const watched = useWatch({ control, name: `items.${i}` });
const { netAmount, taxAmount } = useMemo(() => {
  const sub = round2(watched.price * watched.qty);
  const disc = round2((sub * watched.discount_rate) / 100);
  return { netAmount: round2(sub - disc), taxAmount: round2(((sub - disc) * watched.tax_rate) / 100) };
}, [watched.price, watched.qty, watched.discount_rate, watched.tax_rate]);

useEffect(() => {
  form.setValue(`items.${i}.net_amount`, netAmount);
}, [netAmount, form, i]);
```

### SonarQube Rules

- **No nested ternary** — use `&&` pattern:

  ```tsx
  {isLoading && <Spinner />}
  {!isLoading && data.length > 0 && <List />}
  {!isLoading && data.length === 0 && <Empty />}
  ```

- **No array index as key** — use `key={item.id}` or composite key
- **No `any`** — define proper types, use `unknown` + type narrowing

### New row sentinel

```ts
const NEW_ROW_ID = "__new__"; // Module-level constant for inline add row
```

---

## 11. Testing

### Structure

- Files: `{dir}/__tests__/{name}.test.ts(x)` (colocated)
- Framework: Vitest + jsdom + @testing-library/react
- Setup: `vitest.setup.ts` imports jest-dom matchers + polyfills ResizeObserver

### Mock Patterns

```ts
// Always mock httpClient, not individual API functions
vi.mock("@/lib/http-client", () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

// Mock profile for hooks that need buCode
vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ buCode: "BU001" }),
}));

// QueryClient wrapper (retry: false)
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children);
}
```

### What to Test

- Hooks: success/error responses, correct URL construction
- API routes: path validation, auth flow, error responses
- Components: complex interaction logic (form submission, dialog state), not simple renders
- Use `userEvent.setup()` for interaction, `waitFor()` for async assertions

---

## 12. Git Conventions

- Messages: concise, imperative, English
- Format: `type: description` — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Branch: `main` for production, feature branches for collaboration

---

## 13. Environment Variables

```bash
# Required (server-side only)
BACKEND_URL=               # Backend API base URL
X_APP_ID=                  # App identifier for backend auth

# Required (public)
NEXT_PUBLIC_FRONTEND_URL=  # Frontend base URL
NEXT_PUBLIC_WS_URL=        # WebSocket URL for real-time
NEXT_PUBLIC_X_APP_ID=      # App identifier (client-side)

# Optional
EXCHANGE_RATE_API_KEY=     # External exchange rate API
```

Server-only vars validated at startup via `requireEnv()` in `lib/env.ts`.

---

## 14. Next.js 16 Specifics

- `params` in page components is `Promise` — unwrap with `const { id } = use(params)`
- Output: standalone (optimized for containers)
- Package import optimization: radix-ui, @dnd-kit/*, @tanstack/react-table, react-day-picker, cmdk
