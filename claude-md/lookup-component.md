# Lookup Component Guideline

Lookup = searchable dropdown สำหรับเลือก entity (Vendor, Product, Location ฯลฯ)

---

## 2 รูปแบบ

| รูปแบบ | ใช้เมื่อ | UI |
|--------|----------|-----|
| **Popover + Command** | Item เยอะ ต้อง search | Popover → CommandInput → CommandList |
| **Select** | Item น้อย ไม่ต้อง search | Select → SelectContent → SelectItem |

---

## Standard Props Interface

```tsx
// Popover + Command (ส่วนใหญ่)
interface LookupEntityProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

// Select (Currency, CreditTerm, Workflow ฯลฯ)
interface LookupSelectProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly size?: "xs" | "sm" | "default"; // default: "sm"
  readonly className?: string;
}
```

### Optional Props (ใช้ตามกรณี)

| Prop | Type | ใช้เมื่อ |
|------|------|----------|
| `onItemChange` | `(item: T) => void` | ต้องการ full object เพื่อ setValue fields อื่น |
| `excludeIds` | `Set<string>` | ป้องกันเลือกซ้ำ (เช่น vendor list) |
| `defaultLabel` | `string` | แสดง label เริ่มต้นตอน value ไม่อยู่ใน list |
| `productId` / `locationId` | `string` | Dependent lookup — query ขึ้นกับ parent field |
| `workflowType` | `WORKFLOW_TYPE` | Required enum parameter |

---

## Data Fetching

```tsx
// Standard: ดึงทั้งหมดด้วย perpage: -1
const { data } = useEntity({ perpage: -1 });
const items = useMemo(
  () => data?.data?.filter((v) => v.is_active) ?? [],
  [data?.data],
);

// Dependent: useQuery ที่ enabled ตาม parent
const { data: units = [] } = useQuery<Unit[]>({
  queryKey: ["product-units", buCode, productId],
  queryFn: async () => { /* ... */ },
  enabled: !!buCode && !!productId,
});
```

### Filter ที่ใช้

- ส่วนใหญ่: `v.is_active`
- Product: `v.product_status_type === "active"`
- PriceList/Template: `v.status === "active"`
- บาง lookup ไม่ filter (Department, GRN, Workflow)

---

## การใช้งานใน Form vs Table

### Form Context

```tsx
<Controller
  control={form.control}
  name="vendor_id"
  render={({ field }) => (
    <LookupVendor
      value={field.value}
      onValueChange={field.onChange}
      disabled={disabled}
    />
  )}
/>
```

### Table Context (inline cell)

```tsx
<Controller
  control={form.control}
  name={`items.${row.index}.location_id`}
  render={({ field }) => (
    <LookupLocation
      value={field.value ?? ""}
      onValueChange={field.onChange}
      disabled={disabled}
      className="w-full text-[11px]"
    />
  )}
/>
```

### Cascading Lookup (parent → child)

```tsx
// แยก component เพื่อ useWatch เฉพาะ field ที่สนใจ
function WatchedProductUnit({ control, index, unitField, disabled }) {
  const productId = useWatch({ control, name: `items.${index}.product_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.${unitField}`}
      render={({ field }) => (
        <LookupProductUnit
          productId={productId}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
}
```

### Side Effect Pattern (เลือกแล้ว setValue fields อื่น)

```tsx
<LookupProduct
  value={field.value ?? ""}
  onValueChange={(value, product) => {
    field.onChange(value);
    if (product) {
      form.setValue(`items.${index}.product_name`, product.name);
    }
    // Reset dependent fields
    form.setValue(`items.${index}.unit_id`, "");
  }}
/>
```

---

## Styling

| Context | className |
|---------|-----------|
| Form (standalone) | default (ไม่ต้องใส่) |
| Table cell | `className="w-full text-[11px]"` หรือ `text-xs` |
| Select size ใน table | `size="xs"` |

---

## Lookup ที่มีอยู่แล้ว (ใน `components/lookup/`)

### Popover + Command
LookupVendor, LookupProduct, LookupLocation, LookupUnit, LookupDepartment, LookupItemGroup, LookupDeliveryPoint, LookupProductUnit, LookupProductInLocation, LookupGrn, LookupPriceList, LookupPrt, LookupBuType

### Select
LookupCurrency, LookupCreditTerm, LookupCnReason, LookupTaxProfile, LookupWorkflow

---

## สร้าง Lookup ใหม่

1. สร้างไฟล์ `components/lookup/lookup-{entity}.tsx`
2. ใช้ Popover+Command (item เยอะ) หรือ Select (item น้อย)
3. Props ตาม standard interface ด้านบน
4. Fetch ด้วย `useEntity({ perpage: -1 })` + filter `is_active`
5. ใส่ `readonly` ทุก prop
