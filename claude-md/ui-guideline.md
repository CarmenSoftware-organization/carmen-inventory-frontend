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

| ส่วน | Class |
|------|-------|
| Card | `gap-6 py-6` |
| CardHeader | `gap-2 px-6` |
| CardContent | `px-6` |

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
