# UI Guideline — Compact ERP

ระบบนี้เป็น ERP ต้องการ UI ที่ **compact, dense, ข้อมูลเยอะในพื้นที่น้อย**

---

## Spacing

| ระดับ | Class | ตัวอย่าง |
|-------|-------|----------|
| Page layout | `gap-4 p-3` | Root content area |
| Page sections | `space-y-4` | Form wrapper, sections หลัก |
| Nested sections | `space-y-3` | Tab content ย่อย, grouped fields |
| Title ↔ toolbar | `space-y-2` | DisplayTemplate |
| Button groups | `gap-2` | Toolbar, dialog footer, actions |
| Grid form | `grid-cols-2 gap-2` | 2-column layout |

## Form

| ส่วน | Class |
|------|-------|
| FieldGroup (default) | `gap-7` |
| FieldGroup (compact) | `gap-3` |
| Field content (label ↔ input) | `gap-1.5` |
| Input height | `h-8` (ปกติ), `h-7` (inline table), `h-6` (dense table) |
| Input text | `text-sm` |
| Label text | `text-xs` |

## Dialog

| แบบ | Class |
|-----|-------|
| ปกติ | `gap-4 p-6` |
| Compact (form ง่าย) | `gap-3 p-4`, `sm:max-w-sm` |
| Header | `gap-0 pb-1` (compact), `gap-2` (ปกติ) |
| Footer | `gap-2 pt-1` |
| Title | `text-sm` |

## Card

> **ห้ามใช้ Card** — User กลุ่มเป้าหมายอายุเยอะ ต้องการ clarity ไม่ใช่ decoration
>
> - ใช้ spacing + section header (`<h2>`) แทน
> - Card = visual noise ดูรกตา อ่านยากขึ้น

## Form Section Layout

Form ที่มีหลาย fields ให้แบ่งเป็น **section** ด้วย `<section>` + `<h2>` + `<FieldGroup>`:

```tsx
<div className="space-y-4">
  {/* ── Section Name ── */}
  <section className="space-y-3">
    <h2 className="text-sm font-semibold">Section Name</h2>
    <FieldGroup className="gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field>...</Field>
        <Field>...</Field>
      </div>
    </FieldGroup>
  </section>
</div>
```

| ส่วน | Class |
|------|-------|
| Wrapper รวม sections | `space-y-4` |
| แต่ละ section | `<section className="space-y-3">` |
| Section header | `<h2 className="text-sm font-semibold">` |
| FieldGroup | `gap-3` (compact) |
| Grid ภายใน | `grid-cols-2 gap-2` (default), `grid-cols-3 gap-2` (ถ้าต้องการ) |

### Section Header + Badge

ถ้า section มี status หรือ context เพิ่มเติม ใช้ Badge ข้าง `<h2>`:

```tsx
<div className="flex items-center gap-2">
  <h2 className="text-sm font-semibold">Recipe Identity</h2>
  <Badge variant="success-light" size="sm">PUBLISHED</Badge>
</div>
```

Badge variants ที่ใช้บ่อย:

- Status: `info-light` (Draft), `success-light` (Published/Active), `warning-light` (Archived/Warning), `destructive-light` (Inactive/Error)
- Label: `outline` (KPI, Required, etc.)

### Sub-group ภายใน Section

ถ้า section มี fields เยอะ แบ่งย่อยด้วย uppercase label + `<Separator>`:

```tsx
<FieldGroup className="gap-3">
  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    Sub-group Name
  </p>
  <div className="grid grid-cols-2 gap-2">...</div>

  <Separator />

  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    Another Sub-group
  </p>
  <div className="grid grid-cols-2 gap-2">...</div>
</FieldGroup>
```

### FieldDescription

ใช้ `<FieldDescription>` ใต้ input สำหรับ field ที่ต้องการคำอธิบายเพิ่ม (user อายุเยอะ ต้องการ clarity):

```tsx
<Field>
  <FieldLabel className="text-xs" required>Cuisine</FieldLabel>
  <LookupCuisine ... />
  <FieldDescription className="text-xs">
    The culinary tradition this recipe belongs to
  </FieldDescription>
  <FieldError>...</FieldError>
</Field>
```

- ใช้ `className="text-xs"` เสมอ
- ใส่เฉพาะ field ที่อาจสับสน ไม่ต้องใส่ทุก field

### Input Suffix (Unit)

สำหรับ field ที่มีหน่วย (min, %, kg CO2e):

```tsx
<div className="relative">
  <Input
    type="number"
    step="0.01"
    className="h-8 pr-12 text-right text-sm"
    {...form.register("field_name")}
  />
  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
    min
  </span>
</div>
```

- `pr-8` สำหรับ suffix สั้น (%), `pr-12` สำหรับ suffix ยาว (min), `pr-16` สำหรับ suffix ยาวมาก (kg CO2e)
- `text-right` สำหรับ number fields เสมอ

### Textarea สำหรับ List Data

สำหรับ field ที่รับ list (tags, allergens, URLs):

```tsx
<Textarea
  placeholder={"Gluten\nDairy\nNuts"}
  className="font-mono text-sm"
  rows={3}
  {...form.register("allergens")}
/>
```

- ใช้ `font-mono` เพื่อให้อ่าน list ง่าย
- placeholder แสดงตัวอย่างจริง ไม่ใช่ "Optional"

### Tab with Icon

Tab trigger สามารถมี Lucide icon ได้:

```tsx
<TabsTrigger value="general" className="text-xs">
  <BookOpen className="size-3.5" />
  General
</TabsTrigger>
```

## DataGrid / Table

โปรเจคนี้ใช้ **dense mode เป็นค่าเริ่มต้น** ทุก DataGrid:

```tsx
<DataGrid
  table={table}
  recordCount={totalRecords}
  tableLayout={{ dense: true }}
  tableClassNames={{ base: "text-xs" }}
>
```

| Mode | Header | Body cell |
|------|--------|-----------|
| Dense (default) | `px-2 h-8` | `px-2 py-1.5` |
| Normal | `px-3` | `px-3 py-2` |

- Cell text: `text-xs` หรือ `text-[11px]`
- Inline input ใน table: `h-6 text-[11px]` หรือ `h-7 text-xs`
- Lookup ใน table: `text-[11px]` หรือ `text-xs`
- **emptyMessage**: ทุก DataGrid ต้องใช้ `<EmptyComponent>` จาก `@/components/empty-component` เสมอ ห้ามใช้ string หรือ inline JSX

## Font Size

| Context | Size |
|---------|------|
| Table cell / dense | `text-xs` (`12px`) หรือ `text-[11px]` |
| Form label | `text-xs` |
| Form input | `text-sm` (`14px`) |
| Tab trigger | `text-xs` |
| Dialog title | `text-sm` |
| Badge | `text-[11px]` หรือ `text-xs` |
| Page title | `text-lg font-semibold` |
| Page description | `text-sm text-muted-foreground` |

## Button Size

| Context | Size prop | ผลลัพธ์ |
|---------|-----------|---------|
| Page actions | `sm` | `h-8 px-3 gap-1.5` |
| Dialog submit/cancel | `sm` | `h-8 px-3` |
| Inline table action | `icon-xs` / `xs` | `size-6` / `h-6 px-2` |
| Icon in table | `ghost` + `icon-xs` | `size-6`, icon `h-3.5 w-3.5` |
| Toolbar back | `ghost` + `icon-sm` | `size-8` |

## Tabs

| ส่วน | Class |
|------|-------|
| TabsList | `variant="line"` (form), default (อื่นๆ) |
| TabsTrigger | `text-xs` |
| TabsContent (general) | `space-y-2.5 pt-2.5` |
| TabsContent (sub-tabs) | `space-y-3 pt-4` |
| Badge count on tab | `ml-1 h-4.5 min-w-5 rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground` |

## Key Rules

1. **Dense by default** — ทุก DataGrid ใช้ `dense: true` เสมอ
2. **text-xs เป็นหลัก** — table, label, tab ใช้ `text-xs` ทั้งหมด
3. **text-sm สำหรับ input** — form input ใช้ `text-sm` (อ่านง่ายตอนพิมพ์)
4. **h-8 เป็น input มาตรฐาน** — ใน form ปกติ, ลดเป็น `h-7`/`h-6` ใน table
5. **gap-2 เป็นค่าเริ่มต้น** — สำหรับ button groups, toolbars
6. **space-y-4 สำหรับ page** — sections หลักห่างกัน `1rem`
7. **space-y-3 สำหรับ nested** — sub-sections ห่างกัน `0.75rem`
