# Form & Validation Guideline

---

## Schema File Structure

ไฟล์: `_components/{prefix}-form-schema.ts` — colocated กับ form component

ต้อง export 4 อย่าง:

```ts
// 1. Zod schema
export const prSchema = z.object({ ... });

// 2. Form value type (infer จาก schema)
export type PrFormValues = z.infer<typeof prSchema>;

// 3. Empty form constant
export const EMPTY_FORM: PrFormValues = { ... };
// หรือ item-level constant
export const PR_ITEM: PrFormValues["items"][number] = { ... };

// 4. Helper functions
export function getDefaultValues(entity?: Entity): PrFormValues { ... }
export function mapItemToPayload(item: PrFormValues["items"][number]): Payload { ... }
```

---

## Zod Schema Patterns

### Required string
```ts
name: z.string().min(1, "Name is required"),
```

### Optional string
```ts
description: z.string(), // ไม่ต้อง .optional() ใช้ default "" แทน
```

### Nullable lookup (required)
```ts
product_id: z.string().nullable().refine((v) => !!v, "Product is required"),
```

### Nullable lookup (optional)
```ts
tax_profile_id: z.string().nullable().optional(),
```

### Number (from input)
```ts
requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
cost_per_unit: z.coerce.number().min(0, "Cost must be 0 or more"),
discount_rate: z.coerce.number().min(0).max(100),
```

### Boolean
```ts
is_active: z.boolean(),
is_tax_adjustment: z.boolean(),
```

### Enum
```ts
credit_note_type: z.enum(["quantity_return", "amount_discount"], {
  required_error: "Credit note type is required",
}),
```

### Nested array (line items)
```ts
items: z.array(detailSchema),
```

### Cross-field validation (refine บน object)
```ts
export const rfpSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.end_date) >= new Date(data.start_date);
  },
  { message: "End date must be after start date", path: ["end_date"] },
);
```

---

## getDefaultValues()

แปลง API response → form values, handle null/undefined

```ts
export function getDefaultValues(
  entity?: PurchaseRequest,
  template?: PurchaseRequestTemplate,
): PrFormValues {
  if (entity) {
    return {
      pr_date: isoToDateInput(entity.pr_date),
      description: entity.description ?? "",
      items: entity.details?.map((d) => ({
        id: d.id,
        product_id: d.product_id,
        // ... null coalescing ทุก field
      })) ?? [],
    };
  }
  if (template) {
    return { /* template defaults */ };
  }
  return EMPTY_FORM;
}
```

### Rules
- ใช้ `??` สำหรับ fallback ทุก field
- Date ใช้ `isoToDateInput()` แปลง ISO → `YYYY-MM-DD`
- Nested array ใช้ `?.map()` + fallback `?? []`
- รองรับหลาย source (entity, template)

---

## mapItemToPayload()

แปลง form values → API payload, เพิ่ม computed fields

```ts
export function mapItemToPayload(
  item: PrFormValues["items"][number],
  index?: number,
): DetailPayload {
  return {
    product_id: item.product_id || null,  // falsy → null
    requested_qty: item.requested_qty,
    sequence: (index ?? 0) + 1,           // computed field
    current_stage_status:
      item.current_stage_status === "draft"
        ? "pending"                        // transform value
        : item.current_stage_status,
  };
}
```

### Rules
- Falsy string → `null` (ใช้ `|| null`)
- เพิ่ม sequence จาก index
- Transform status values ตาม business logic

---

## Form Submit — Add/Update/Remove Pattern

สำหรับ form ที่มี line items (useFieldArray):

```ts
const onSubmit = (values: PrFormValues) => {
  // แยก new vs existing items
  const newItems = values.items.filter((item) => !item.id);
  const existingItems = values.items.filter((item) => !!item.id);

  // หา removed items (อยู่ใน defaults แต่ไม่อยู่ใน current)
  const currentIds = new Set(existingItems.map((item) => item.id));
  const removedItems = defaultValues.items
    .filter((item) => !!item.id && !currentIds.has(item.id))
    .map((item) => ({ id: item.id }));

  // หา updated items (เปลี่ยนจาก original)
  const updatedItems = existingItems.filter((item) => {
    const original = defaultValues.items.find((d) => d.id === item.id);
    return JSON.stringify(item) !== JSON.stringify(original);
  });

  const payload = {
    details: {
      add: newItems.length > 0 ? newItems.map(mapItemToPayload) : undefined,
      update: updatedItems.length > 0 ? updatedItems.map(...) : undefined,
      remove: removedItems.length > 0 ? removedItems : undefined,
    },
  };
};
```

---

## useFieldArray

```ts
const { fields: itemFields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});

// Add item
const handleAddItem = () => {
  append({
    ...PR_ITEM,
    currency_id: defaultBu?.config.default_currency_id ?? null,
  });
};

// Remove item
const handleDeleteItem = (index: number) => {
  remove(index);
};
```

---

## useWatch — Performance Pattern

แยก component ย่อย + useWatch เฉพาะ field ที่สนใจ ป้องกัน re-render ทั้ง form

```tsx
// Bad — re-render ทุกครั้งที่ form เปลี่ยน
function Cell({ form, index }) {
  const locationId = form.watch(`items.${index}.location_id`);
  // ...
}

// Good — re-render เฉพาะเมื่อ location_id เปลี่ยน
function Cell({ control, index }) {
  const locationId = useWatch({ control, name: `items.${index}.location_id` }) ?? "";
  // ...
}
```

### Computed Values จาก useWatch

```tsx
const watched = useWatch({ control: form.control, name: `items.${i}` });
const { netAmount, taxAmount, totalPrice } = useMemo(() => {
  const sub = round2(watched.price * watched.qty);
  const disc = round2((sub * watched.discount_rate) / 100);
  const net = round2(sub - disc);
  const tax = round2((net * watched.tax_rate) / 100);
  return { netAmount: net, taxAmount: tax, totalPrice: round2(net + tax) };
}, [watched.price, watched.qty, watched.discount_rate, watched.tax_rate]);

// Sync computed values กลับ form
useEffect(() => {
  form.setValue(`items.${i}.net_amount`, netAmount);
  form.setValue(`items.${i}.total_price`, totalPrice);
}, [netAmount, totalPrice, form, i]);
```

---

## React Compiler — "use no memo"

ใส่ `"use no memo"` เมื่อ component ใช้ `useFieldArray` + dynamic `setValue` เพราะ React Compiler auto-memoize แล้วเกิด stale closure

```ts
"use no memo";

import { useFieldArray } from "react-hook-form";
// ...
```

---

## zodResolver Type Assertion

จำเป็นต้อง cast เพราะ `@hookform/resolvers` กับ `react-hook-form` export `Resolver` type คนละตัว:

```ts
import { type Resolver } from "react-hook-form";

const form = useForm<PrFormValues>({
  resolver: zodResolver(prSchema) as Resolver<PrFormValues>,
  defaultValues,
});
```
