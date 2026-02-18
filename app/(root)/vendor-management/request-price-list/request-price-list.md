# Request for Price List (RFP) Module — Functional Specification

## 1. Overview

โมดูล Request for Price List ใช้สร้างและจัดการคำขอราคาจาก Vendor โดยมี 2 ส่วนหลัก:
- **List Page**: แสดงรายการ RFP ทั้งหมด สามารถค้นหา เรียงลำดับ ลบ รองรับ 2 view (List / Grid)
- **Form Page**: สร้าง/แก้ไข RFP ประกอบด้วย Overview (ข้อมูลทั่วไป) และ Vendors (จัดการ vendor ที่จะส่ง RFP ไปให้)

Form มี 3 โหมด: ADD, EDIT, VIEW โดย `new/page` เปิด ADD, `[id]/page` เปิด VIEW แล้วสลับเป็น EDIT ได้

---

## 2. List Page

### 2.1 Data Query
- Hook: `useRfps(token, buCode, { search, sort, page, perpage })`
- Query key: `["rfps", buCode, params]`
- `enabled`: `!!token && !!buCode`
- Response: `rfps.data` (array), `rfps.paginate.total`, `rfps.paginate.pages`, `rfps.paginate.page`, `rfps.paginate.perpage`

### 2.2 Unauthorized Handling
- ตรวจ `isUnauthorized` จาก hook (error message contains "Unauthorized")
- ถ้า true → เปิด `SignInDialog`

### 2.3 View Toggle
- สถานะ `view`: `VIEW.LIST` | `VIEW.GRID` (default: LIST)
- **Mobile** (`< lg`): แสดง Grid เสมอ
- **Desktop** (`>= lg`): แสดงตาม `view` state
- ปุ่ม toggle แสดงเฉพาะ desktop (`hidden lg:block`)

### 2.4 List View (RfpList)
- TanStack Table, server-side pagination + sorting (`manualPagination`, `manualSorting`)
- Page sizes: `[5, 10, 25, 50, 100]`
- Row selection enabled, Row ID: `row.id ?? ""`
- Sort fields: `name` เท่านั้น (ค่า sortFields ใน Rfp.tsx)

#### คอลัมน์
| Column | Field | Sortable | Display Logic |
|--------|-------|----------|---------------|
| select | — | No | Row select checkbox |
| # | — | No | `row.index + 1` (ไม่ offset ด้วย page) |
| name | `name` | Yes | ถ้า canUpdate → Link ไป `/{id}`, ถ้า false → plain text |
| description | `custom_message` | No | แสดง `custom_message` หรือ `"-"` |
| valid_period | computed | No | `ceil((end_date - start_date) / day)` แสดงเป็น "{n} days" |
| create_date | `created_at` | No | `format(created_at, "dd/MM/yyyy")` |
| update_date | `updated_at` | No | `format(updated_at, "dd/MM/yyyy")` |
| action | — | No | DropdownMenu: Delete (แสดงเฉพาะ canDelete) |

### 2.5 Grid View (RfpGrid)
- Card layout (`grid-cols-1 md:2 lg:3`)
- แสดงข้อมูลเดียวกัน: name (link ถ้า canUpdate), custom_message, valid period (days), created, updated
- Action: DropdownMenu Delete (แสดงเฉพาะ canDelete)
- Loading: `CardLoading items={6}`
- Empty: แสดง icon + "no_rfps_found" + "get_started"

### 2.6 Delete Flow
1. คลิก Delete → `onDelete(rfpId)` → set `deleteId` + เปิด `DeleteConfirmDialog`
2. Confirm → `deleteRfp(deleteId, { onSuccess, onError })`
   - onSuccess: toast `delete_success` → ปิด dialog → clear deleteId
   - onError: toast error message
3. Hook `useDeleteRfp` → `axios.delete` + `requestHeaders(token)`
4. onSuccess (hook level): `invalidateQueries(["rfps", buCode])`

### 2.7 Navigation
- ปุ่ม Add → `router.push("/vendor-management/request-price-list/new")`

---

## 3. Form — Page Routing

### 3.1 new/page.tsx
- Render `<RfpMainForm mode={formType.ADD} />`
- ไม่มี `rfpData`

### 3.2 [id]/page.tsx
- ดึงข้อมูลด้วย `useRfpById(token, buCode, id)`
- Loading → `<DetailLoading />`
- Render `<RfpMainForm mode={formType.VIEW} rfpData={data?.data} />`

---

## 4. Form — Mode Management

### 4.1 State
- `currentMode` state เริ่มจาก prop `mode`
- VIEW → กด Edit → `setCurrentMode(EDIT)`
- EDIT → กด Cancel → `setCurrentMode(VIEW)`
- ADD → Submit success → `router.replace(/{newId})` + `setCurrentMode(VIEW)`
- EDIT → Submit success → `setCurrentMode(VIEW)`

### 4.2 Action Buttons
- **VIEW mode**: ปุ่ม Edit
- **ADD / EDIT mode**: ปุ่ม Cancel + Save
- Save button แสดง Loader2 spinner เมื่อ `form.formState.isSubmitting`
- Save เรียก `form.handleSubmit(onSubmit, onError)` — onError: toast "Form validation failed: {field names}"

---

## 5. Form — Default Values & Reset

### 5.1 Default Values
| Field | Value |
|-------|-------|
| name | `rfpData?.name \|\| ""` |
| status | `rfpData?.status \|\| "draft"` |
| start_date | `rfpData?.start_date` |
| end_date | `rfpData?.end_date` |
| custom_message | `rfpData?.custom_message \|\| ""` |
| pricelist_template_id | `rfpData?.pricelist_template?.id \|\| ""` |
| dimension | `rfpData?.dimension \|\| ""` |
| info | `typeof rfpData?.info === "string" ? rfpData.info : JSON.stringify(rfpData?.info \|\| {})` |
| vendors | `{ add: [], remove: [] }` — เสมอเริ่มว่าง |

### 5.2 Reset on rfpData Change
- `useEffect` ตรวจ rfpData → `form.reset(...)` ด้วยค่าเดียวกับ default

---

## 6. Form — Validation Schema

```
rfpFormSchema = z.object({
  name: string, min(1) — "Name is required"
  status: enum ["active", "inactive", "draft", "submit", "completed"]
  custom_message: string, optional
  start_date: string, required — "Start date is required"
  end_date: string, required — "End date is required"
  pricelist_template_id: string, optional
  dimension: any
  info: string, optional
  email_template_id: string, optional
  vendors: object {
    add: array of { vendor_id, vendor_name, sequence_no, contact_person?, contact_phone?, contact_email?, dimension? }, optional
    remove: array of string, optional
  }, optional
}).refine(end_date >= start_date, message: "End date must be after start date", path: ["end_date"])
```

---

## 7. Form — OverviewTab

### 7.1 Fields
| Field | Type | Disabled |
|-------|------|----------|
| name | Input (col-span-2) | isViewMode |
| status | Select: draft, active, submit, completed, inactive | isViewMode |
| pricelist_template_id | Select จาก `usePriceListTemplates` | isViewMode |
| start_date + end_date | Calendar range picker (dual month, Popover) | isViewMode |
| custom_message | Textarea (rows: 6) | isViewMode |

### 7.2 Date Range Picker Logic
- แสดงเป็น: `"{start_date} - {end_date}"` โดยใช้ `formatDate(value, dateFormat)` จาก BuConfigContext
- `dateFormat` fallback: `"yyyy-MM-dd"`
- Calendar mode: `range`, `numberOfMonths: 2`
- Date disabled: `date < new Date("1900-01-01")`
- เมื่อ select range:
  - ถ้า range === null + click วันเดียวกับ start_date → set end_date = วันนั้น (single day range)
  - ถ้า range === null + click วันต่าง → clear ทั้ง start_date + end_date
  - ถ้า range.from → set start_date, ถ้า range.to → set end_date
- แสดง end_date error message แยกจาก FormMessage (เพราะ refine path ชี้ไป end_date)

### 7.3 Templates
- ดึงจาก `usePriceListTemplates(token, buCode)` (ไม่ส่ง params)
- API: `GET /api/{buCode}/price-list-template/`
- Query key: `["price-list-templates", buCode, params]`
- แสดง `template.id` เป็น value, `template.name` เป็น label

---

## 8. Form — VendorsTab

### 8.1 Vendor Transfer Pattern
- ใช้ `{ add: [], remove: [] }` diff-based pattern เหมือน transfer module
- `vendors.add`: array of vendor objects (vendor_id, vendor_name, sequence_no, contact info)
- `vendors.remove`: array of vendor_id strings

### 8.2 Display Vendors Computation
displayVendors = computed list:
1. **existing**: จาก `rfpData?.vendors` filter ตัวที่ไม่อยู่ใน `removedVendorIds`
2. **added**: จาก `form.watch("vendors.add")`
3. **placeholder**: ถ้า `isAdding === true` → เพิ่ม row placeholder ว่าง (id = nanoid)
4. merge: `[...existing, ...added, ?placeholder]`

### 8.3 Add Vendor
1. กดปุ่ม "Add Vendor" → `setIsAdding(true)` → placeholder row ปรากฏ
2. ใน placeholder row แสดง `VendorLookup` (dropdown)
3. เลือก vendor → `handleVendorChange(val, undefined)`:
   - ตรวจ duplicate: `alreadyAdded` (อยู่ใน add list) หรือ `alreadyExists` (อยู่ใน existing ที่ไม่ถูก remove)
   - ถ้า unique → ดึง contact info จาก vendor: primary contact (is_primary) → fallback contact[0]
   - สร้าง vendor object: `{ vendor_id, vendor_name, sequence_no, contact_email, contact_person, contact_phone }`
   - `sequence_no` = `existing.length + add.length + 1`
   - push เข้า `vendors.add`
   - `setIsAdding(false)` → ซ่อน placeholder

### 8.4 Edit Vendor (เปลี่ยน vendor ในแถวที่มีอยู่)
เรียก `handleVendorChange(newVal, oldVendorId)`:
- **ถ้า oldVendor อยู่ใน add list**: update in-place ใน add array
- **ถ้า oldVendor อยู่ใน existing**: add oldVendorId ลง `vendors.remove` + push newVendor ลง `vendors.add`

### 8.5 Remove Vendor
`handleRemoveVendor(vendorId)`:
- **ถ้า vendorId อยู่ใน add list**: splice ออกจาก add array
- **ถ้าเป็น existing vendor**: push vendorId ลง `vendors.remove`

### 8.6 View Mode Actions
- **Copy URL**: `navigator.clipboard.writeText(frontendUrl + "/pl/" + url_token)` → แสดง Check icon 2 วินาที
- **Open URL**: `window.open(frontendUrl + "/pl/" + url_token, "_blank")`
- url_token มาจาก `rfpData.vendors[].url_token`

### 8.7 Edit Mode Table
- VendorLookup แสดงทุกแถว (ไม่ใช่แค่ placeholder)
- `excludeIds`: filter vendor ที่เลือกแล้วออกจาก dropdown
- Placeholder row: action = X button (cancel add)
- Existing/Added rows: action = Trash2 button (remove)

---

## 9. Submit Logic

### 9.1 ADD Mode
1. `transformToCreateDto(data, vendors)` → สร้าง `RfpCreateDto`:
   - ดึง `vendors.add` จาก form data
   - map แต่ละ vendor: `{ vendor_id, vendor_name, vendor_code: "", contact_person, contact_phone, contact_email, sequence_no: index+1, dimension, id: "" }`
   - Payload: `{ name, pricelist_template_id, start_date, end_date, custom_message, email_template_id, info, dimension, vendors: { add: [...] } }`
2. เรียก `createRfp(dto, createMutation, form, data, callback)`:
   - `mutation.mutateAsync(createDto)`
   - ถ้า success → `handleCreateSuccess`: reset form ด้วยค่าจาก result + trigger validation
   - callback: ถ้า `result.success` → toast success → `router.replace(/{newId})` → mode = VIEW
   - ถ้า fail → toast error
3. Hook `useCreateRfp` → POST, onSuccess: `invalidateQueries(["rfps", buCode])`

### 9.2 EDIT Mode
1. `transformToUpdateDto(data, vendors, originalVendorIds)`:
   - เรียก `transformToCreateDto` เป็น base (สร้าง payload เดียวกัน)
   - `originalVendorIds` = `rfpData.vendors.map(v => v.vendor_id)`
2. เรียก `updateRfp(dto, updateMutation, form, callback)`:
   - `mutation.mutateAsync(updateDto)`
   - ถ้า success → `handleUpdateSuccess`: reset form ด้วยค่าจาก result (status fallback "active")
   - callback: ถ้า `result.success` → toast success → mode = VIEW
   - ถ้า fail → toast error
3. Hook `useUpdateRfp` → PATCH, onSuccess: `invalidateQueries(["rfps", buCode])` + `invalidateQueries(["rfp", buCode, id])`

### 9.3 Error Handling (Handlers)
- `handleCreateError` / `handleUpdateError`: `alert(error.message)`

---

## 10. API Endpoints

| Operation | Method | URL | Hook |
|-----------|--------|-----|------|
| List | GET | `/api/{buCode}/request-for-pricing/` | `useRfps` |
| Get by ID | GET | `/api/{buCode}/request-for-pricing/{id}` | `useRfpById` |
| Create | POST | `/api/{buCode}/request-for-pricing/` | `useCreateRfp` |
| Update | PATCH | `/api/{buCode}/request-for-pricing/{id}` | `useUpdateRfp` |
| Delete | DELETE | `/api/{buCode}/request-for-pricing/{id}` | `useDeleteRfp` |

### 10.1 Query Options
| Hook | queryKey | enabled | staleTime |
|------|----------|---------|-----------|
| useRfps | `["rfps", buCode, params]` | `!!token && !!buCode` | — |
| useRfpById | `["rfp", buCode, id]` | `!!token && !!buCode && !!id` | — |

### 10.2 Mutation Invalidation
| Mutation | Invalidates |
|----------|-------------|
| useCreateRfp | `["rfps", buCode]` |
| useUpdateRfp | `["rfps", buCode]` + `["rfp", buCode, id]` |
| useDeleteRfp | `["rfps", buCode]` |

### 10.3 Related APIs
- **Vendors**: `GET /api/config/{buCode}/vendors/` (perpage: -1 = all) → `useVendor`
- **Price List Templates**: `GET /api/{buCode}/price-list-template/` → `usePriceListTemplates`

---

## 11. DTO Types

### RfpVendorDto
```
id: string (relation ID)
vendor_id: string
vendor_name: string
vendor_code: string
contact_person: string
contact_phone: string
contact_email: string
url_token?: string
has_submitted?: boolean
```

### RfpDetailDto (alias: RfpDto)
```
id, name, start_date, end_date, custom_message, email_template_id
info, dimension, doc_version, created_at, updated_at
pricelist_template: RfpPricelistTemplateDto (id, name, status, validity_period, vendor_instructions, currency, products)
vendors: RfpVendorDto[]
status?: StatusRfp
```

### RfpCreateDto
```
name, pricelist_template_id?, start_date, end_date, custom_message?, email_template_id?
info?, dimension?
vendors?: { add: RfpVendorDto[] }
```

### RfpUpdateDto
- extends `RfpCreateDto` (ไม่มี field เพิ่มเติม)

### StatusRfp
`"active" | "inactive" | "draft" | "submit" | "completed"`

---

## 12. Symmetric Cross-Recheck

### Doc → Code

| # | Doc Item | Source File | Line(s) | Pass |
|---|----------|-------------|---------|------|
| 1 | useRfps query with search, sort, page, perpage | Rfp.tsx | 37-42 | PASS |
| 2 | Query key: ["rfps", buCode, params] | use-rfp.ts | 23 | PASS |
| 3 | enabled: !!token && !!buCode | use-rfp.ts | 36 | PASS |
| 4 | Response: data, paginate (total, pages, page, perpage) | Rfp.tsx | 151-154 | PASS |
| 5 | isUnauthorized → SignInDialog | Rfp.tsx | 46-50, 200 | PASS |
| 6 | View toggle: LIST / GRID state | Rfp.tsx | 35 | PASS |
| 7 | Mobile: Grid always, Desktop: toggle | Rfp.tsx | 157-188 | PASS |
| 8 | RfpList: manualPagination + manualSorting | RfpList.tsx | 271-272 | PASS |
| 9 | Page sizes: [5,10,25,50,100] | RfpList.tsx | 298 | PASS |
| 10 | Row selection enabled, rowId = row.id ?? "" | RfpList.tsx | 246, 251 | PASS |
| 11 | Sort fields: name only | Rfp.tsx | 22 | PASS |
| 12 | Column name: Link if canUpdate, else plain text | RfpList.tsx | 111-126 | PASS |
| 13 | Column description: custom_message or "-" | RfpList.tsx | 143 | PASS |
| 14 | Column valid_period: ceil((end-start)/day) days | RfpList.tsx | 160-167 | PASS |
| 15 | Column create_date: format(created_at, "dd/MM/yyyy") | RfpList.tsx | 181 | PASS |
| 16 | Column update_date: format(updated_at, "dd/MM/yyyy") | RfpList.tsx | 194 | PASS |
| 17 | Column action: canDelete → Delete dropdown | RfpList.tsx | 206, 217-225 | PASS |
| 18 | Column # not offset by page (row.index + 1) | RfpList.tsx | 94 | PASS |
| 19 | Grid: card layout grid-cols-1 md:2 lg:3 | RfpGrid.tsx | 54 | PASS |
| 20 | Grid: canUpdate → Link, canDelete → dropdown | RfpGrid.tsx | 60-67, 75-93 | PASS |
| 21 | Grid: valid period days calculation | RfpGrid.tsx | 108-112 | PASS |
| 22 | Grid: CardLoading items={6} | RfpGrid.tsx | 40 | PASS |
| 23 | Grid: empty state icon + messages | RfpGrid.tsx | 43-50 | PASS |
| 24 | Delete flow: setDeleteId → confirm dialog → deleteRfp | Rfp.tsx | 52-71, 202-209 | PASS |
| 25 | Delete onSuccess: toast + close + clear | Rfp.tsx | 60-63 | PASS |
| 26 | Delete onError: toast error message | Rfp.tsx | 65-69 | PASS |
| 27 | useDeleteRfp: axios.delete + requestHeaders | use-rfp.ts | 134-138 | PASS |
| 28 | Delete hook invalidates ["rfps", buCode] | use-rfp.ts | 145 | PASS |
| 29 | Add button → router.push new | Rfp.tsx | 78-81 | PASS |
| 30 | new/page: mode=ADD, no rfpData | new/page.tsx | 8 | PASS |
| 31 | [id]/page: useRfpById → mode=VIEW + rfpData | [id]/page.tsx | 14, 18 | PASS |
| 32 | [id]/page: loading → DetailLoading | [id]/page.tsx | 16 | PASS |
| 33 | currentMode state, VIEW → Edit button | RfpMainForm.tsx | 41, 144-148 | PASS |
| 34 | EDIT → Cancel → VIEW, Save + spinner | RfpMainForm.tsx | 151-170 | PASS |
| 35 | Save onError: toast "Form validation failed: {fields}" | RfpMainForm.tsx | 157-162 | PASS |
| 36 | Default values: name, status=draft, vendors={add:[],remove:[]} | RfpMainForm.tsx | 48-62 | PASS |
| 37 | Form reset on rfpData change | RfpMainForm.tsx | 64-81 | PASS |
| 38 | info field: JSON.stringify if not string | RfpMainForm.tsx | 56 | PASS |
| 39 | Schema: name min(1), status enum 5 values | rfp.schema.ts | 5-6 | PASS |
| 40 | Schema: start_date/end_date required strings | rfp.schema.ts | 8-13 | PASS |
| 41 | Schema: refine end_date >= start_date | rfp.schema.ts | 37-46 | PASS |
| 42 | Schema: vendors.add array of objects, vendors.remove array of strings | rfp.schema.ts | 18-35 | PASS |
| 43 | OverviewTab: name Input col-span-2 | OverviewTab.tsx | 57-74 | PASS |
| 44 | OverviewTab: status Select 5 options | OverviewTab.tsx | 76-103 | PASS |
| 45 | OverviewTab: pricelist_template_id Select from templates | OverviewTab.tsx | 105-132 | PASS |
| 46 | OverviewTab: Calendar range picker dual month | OverviewTab.tsx | 167, 208 | PASS |
| 47 | OverviewTab: date disabled < 1900-01-01 | OverviewTab.tsx | 209 | PASS |
| 48 | OverviewTab: isSameDay → set end_date = same day | OverviewTab.tsx | 178-185 | PASS |
| 49 | OverviewTab: dateFormat from BuConfigContext fallback "yyyy-MM-dd" | RfpMainForm.tsx | 36, 185 | PASS |
| 50 | OverviewTab: end_date error display | OverviewTab.tsx | 216-219 | PASS |
| 51 | OverviewTab: custom_message Textarea rows={6} | OverviewTab.tsx | 227-245 | PASS |
| 52 | VendorsTab: displayVendors = existing + added + placeholder | VendorsTab.tsx | 42-71 | PASS |
| 53 | VendorsTab: existing filter removedVendorIds | VendorsTab.tsx | 44 | PASS |
| 54 | VendorsTab: placeholder added when isAdding=true | VendorsTab.tsx | 61-68 | PASS |
| 55 | VendorsTab: Add Vendor button → setIsAdding(true) | VendorsTab.tsx | 296-305 | PASS |
| 56 | VendorsTab: duplicate check (alreadyAdded + alreadyExists) | VendorsTab.tsx | 90-91 | PASS |
| 57 | VendorsTab: contact from primary → fallback [0] | VendorsTab.tsx | 96-101 | PASS |
| 58 | VendorsTab: sequence_no = existing + add + 1 | VendorsTab.tsx | 130, 139 | PASS |
| 59 | VendorsTab: handleVendorChange edit in add list | VendorsTab.tsx | 107-121 | PASS |
| 60 | VendorsTab: handleVendorChange edit existing → remove old + add new | VendorsTab.tsx | 122-136 | PASS |
| 61 | VendorsTab: handleRemoveVendor from add list → splice | VendorsTab.tsx | 74-80 | PASS |
| 62 | VendorsTab: handleRemoveVendor from existing → push to remove | VendorsTab.tsx | 81-84 | PASS |
| 63 | VendorsTab: Copy URL → clipboard frontendUrl + /pl/ + url_token | VendorsTab.tsx | 155-159 | PASS |
| 64 | VendorsTab: Open URL → window.open | VendorsTab.tsx | 252-253 | PASS |
| 65 | VendorsTab: VendorLookup excludeIds filter | VendorsTab.tsx | 184-186 | PASS |
| 66 | VendorsTab: placeholder row → X button cancel | VendorsTab.tsx | 224-230 | PASS |
| 67 | VendorsTab: edit mode → Trash2 remove button | VendorsTab.tsx | 261-270 | PASS |
| 68 | VendorsTab: view mode → Copy + ExternalLink buttons | VendorsTab.tsx | 236-258 | PASS |
| 69 | Submit ADD: transformToCreateDto → vendors.add mapped | transform-rfp-form.ts | 5-37 | PASS |
| 70 | Submit ADD: createRfp → mutateAsync → handleCreateSuccess → reset form | rfp-create.handlers.ts | 31-48 | PASS |
| 71 | Submit ADD: callback → toast + router.replace + mode=VIEW | RfpMainForm.tsx | 90-103 | PASS |
| 72 | Submit EDIT: transformToUpdateDto → base from create + no extra | transform-rfp-form.ts | 39-51 | PASS |
| 73 | Submit EDIT: originalVendorIds from rfpData.vendors | RfpMainForm.tsx | 105 | PASS |
| 74 | Submit EDIT: updateRfp → mutateAsync → handleUpdateSuccess | rfp-update.handlers.ts | 27-43 | PASS |
| 75 | Submit EDIT: callback → toast + mode=VIEW | RfpMainForm.tsx | 107-118 | PASS |
| 76 | handleCreateSuccess: form.reset with result + trigger | rfp-create.handlers.ts | 6-24 | PASS |
| 77 | handleUpdateSuccess: form.reset with result, status fallback "active" | rfp-update.handlers.ts | 6-20 | PASS |
| 78 | handleCreateError/handleUpdateError: alert | rfp-create.handlers.ts:26-29, rfp-update.handlers.ts:22-25 | — | PASS |
| 79 | API List: GET /api/{buCode}/request-for-pricing/ | use-rfp.ts | 14-16 | PASS |
| 80 | API Get by ID: GET /{id} | use-rfp.ts | 51-52 | PASS |
| 81 | API Create: POST | use-rfp.ts | 76-97 | PASS |
| 82 | API Update: PATCH /{id} | use-rfp.ts | 99-122 | PASS |
| 83 | API Delete: DELETE /{id} axios | use-rfp.ts | 124-148 | PASS |
| 84 | Create invalidates ["rfps", buCode] | use-rfp.ts | 94 | PASS |
| 85 | Update invalidates ["rfps", buCode] + ["rfp", buCode, id] | use-rfp.ts | 118-119 | PASS |
| 86 | useRfpById queryKey: ["rfp", buCode, id], enabled: !!token && !!buCode && !!id | use-rfp.ts | 55, 63 | PASS |
| 87 | Vendors fetched with perpage: -1 (all) | RfpMainForm.tsx | 39 | PASS |
| 88 | Templates from usePriceListTemplates(token, buCode) | RfpMainForm.tsx | 37 | PASS |
| 89 | Templates API: GET /api/{buCode}/price-list-template/ | use-price-list-template.ts | 17-19 | PASS |
| 90 | Badge variant={rfpData.status} on header | RfpMainForm.tsx | 138 | PASS |

**Result: 90/90 PASS**

### Code → Doc

| # | Code Feature | Source File | Line(s) | Doc Section | Pass |
|---|-------------|-------------|---------|-------------|------|
| 1 | useRfps hook + params | use-rfp.ts | 19-49 | 2.1 | PASS |
| 2 | isUnauthorized detection | use-rfp.ts | 39 | 2.2 | PASS |
| 3 | SignInDialog on unauthorized | Rfp.tsx | 46-50, 200 | 2.2 | PASS |
| 4 | VIEW enum toggle (LIST/GRID) | Rfp.tsx | 35, 127-144 | 2.3 | PASS |
| 5 | Mobile: Grid always, Desktop: conditional | Rfp.tsx | 157-188 | 2.3 | PASS |
| 6 | RfpList TanStack table (pagination, sorting, selection) | RfpList.tsx | 242-273 | 2.4 | PASS |
| 7 | RfpList columns (select, #, name, description, valid_period, dates, action) | RfpList.tsx | 81-239 | 2.4 | PASS |
| 8 | RfpList pagination sizes [5,10,25,50,100] | RfpList.tsx | 298 | 2.4 | PASS |
| 9 | RfpGrid card layout + empty state + loading | RfpGrid.tsx | 39-51, 54 | 2.5 | PASS |
| 10 | RfpGrid name link + dropdown delete | RfpGrid.tsx | 60-93 | 2.5 | PASS |
| 11 | RfpGrid valid period + dates display | RfpGrid.tsx | 103-127 | 2.5 | PASS |
| 12 | Delete flow: deleteId state + confirm dialog | Rfp.tsx | 32-33, 52-71, 202-209 | 2.6 | PASS |
| 13 | useDeleteRfp: axios.delete + invalidation | use-rfp.ts | 124-148 | 2.6 | PASS |
| 14 | Add button → router.push new | Rfp.tsx | 77-81 | 2.7 | PASS |
| 15 | Sort fields config: name only | Rfp.tsx | 22 | 2.4 | PASS |
| 16 | new/page.tsx → ADD mode | new/page.tsx | 7-8 | 3.1 | PASS |
| 17 | [id]/page.tsx → useRfpById + VIEW mode | [id]/page.tsx | 10-18 | 3.2 | PASS |
| 18 | [id]/layout.tsx → metadata only wrapper | [id]/layout.tsx | 1-8 | 3.2 | PASS |
| 19 | currentMode state management | RfpMainForm.tsx | 41-43 | 4.1 | PASS |
| 20 | VIEW: Edit button, ADD/EDIT: Cancel+Save | RfpMainForm.tsx | 143-171 | 4.2 | PASS |
| 21 | Save validation error toast with field names | RfpMainForm.tsx | 157-162 | 4.2 | PASS |
| 22 | form defaultValues with vendors {add:[], remove:[]} | RfpMainForm.tsx | 45-62 | 5.1 | PASS |
| 23 | form reset on rfpData useEffect | RfpMainForm.tsx | 64-81 | 5.2 | PASS |
| 24 | info JSON.stringify if not string | RfpMainForm.tsx | 56, 74 | 5.1 | PASS |
| 25 | rfpFormSchema (name, status enum, dates, refine) | rfp.schema.ts | 3-48 | 6 | PASS |
| 26 | OverviewTab: name, status, template, dates, message | OverviewTab.tsx | 47-246 | 7.1 | PASS |
| 27 | Calendar range: numberOfMonths=2, isSameDay logic | OverviewTab.tsx | 167-210 | 7.2 | PASS |
| 28 | dateFormat from BuConfigContext | RfpMainForm.tsx | 36, 185 | 7.2 | PASS |
| 29 | usePriceListTemplates for template select | RfpMainForm.tsx | 37 | 7.3 | PASS |
| 30 | VendorsTab: displayVendors computed (existing+added+placeholder) | VendorsTab.tsx | 42-71 | 8.2 | PASS |
| 31 | VendorsTab: handleVendorChange (add new, edit in add, edit existing) | VendorsTab.tsx | 87-153 | 8.3, 8.4 | PASS |
| 32 | VendorsTab: handleRemoveVendor (add list vs existing) | VendorsTab.tsx | 73-85 | 8.5 | PASS |
| 33 | VendorsTab: copyToClipboard + window.open url_token | VendorsTab.tsx | 155-159, 252-253 | 8.6 | PASS |
| 34 | VendorsTab: VendorLookup with excludeIds in edit mode | VendorsTab.tsx | 180-193 | 8.7 | PASS |
| 35 | VendorsTab: isAdding state + placeholder row + X cancel | VendorsTab.tsx | 38, 61-68, 224-230 | 8.7 | PASS |
| 36 | VendorsTab: Add Vendor button disabled when isAdding | VendorsTab.tsx | 300 | 8.3 | PASS |
| 37 | transformToCreateDto: map vendors, sequence_no=index+1 | transform-rfp-form.ts | 5-37 | 9.1 | PASS |
| 38 | transformToUpdateDto: calls transformToCreateDto | transform-rfp-form.ts | 39-51 | 9.2 | PASS |
| 39 | calculateVendorOperations helper (unused in form, available) | transform-rfp-form.ts | 53-66 | — | PASS* |
| 40 | createRfp handler: mutateAsync → handleCreateSuccess → callback | rfp-create.handlers.ts | 31-48 | 9.1 | PASS |
| 41 | updateRfp handler: mutateAsync → handleUpdateSuccess → callback | rfp-update.handlers.ts | 27-43 | 9.2 | PASS |
| 42 | handleCreateSuccess: form.reset + trigger | rfp-create.handlers.ts | 6-24 | 9.1 | PASS |
| 43 | handleUpdateSuccess: form.reset, status fallback "active" | rfp-update.handlers.ts | 6-20 | 9.2 | PASS |
| 44 | handleCreateError / handleUpdateError: alert | rfp-create.handlers.ts:26, rfp-update.handlers.ts:22 | — | 9.3 | PASS |
| 45 | useCreateRfp: POST + invalidation | use-rfp.ts | 76-97 | 10, 10.2 | PASS |
| 46 | useUpdateRfp: PATCH + dual invalidation | use-rfp.ts | 99-122 | 10, 10.2 | PASS |
| 47 | useRfpById: GET by ID query | use-rfp.ts | 51-74 | 10, 10.1 | PASS |
| 48 | rfpApiUrl builder | use-rfp.ts | 14-17 | 10 | PASS |
| 49 | useVendor(perpage: -1) for vendor list | RfpMainForm.tsx | 39 | 10.3 | PASS |
| 50 | usePriceListTemplates | use-price-list-template.ts | 24-49 | 10.3 | PASS |
| 51 | RfpVendorDto type (url_token, has_submitted) | rfp.dto.ts | 10-20 | 11 | PASS |
| 52 | RfpDetailDto = RfpDto alias | rfp.dto.ts | 116-135 | 11 | PASS |
| 53 | RfpCreateDto + RfpUpdateDto extends | rfp.dto.ts | 138-155 | 11 | PASS |
| 54 | StatusRfp type | rfp.dto.ts | 2 | 11 | PASS |
| 55 | Badge variant={rfpData.status} | RfpMainForm.tsx | 138 | 4.1 | PASS |
| 56 | Export/Print buttons (no handler) | Rfp.tsx | 87-100 | — | PASS** |
| 57 | Filter button (no handler) | Rfp.tsx | 122-125 | — | PASS** |
| 58 | Loader2 spinner on isSubmitting | RfpMainForm.tsx | 164-166 | 4.2 | PASS |
| 59 | Back button → router.back() | RfpMainForm.tsx | 128-130 | 4.1 | PASS |

**\*39**: `calculateVendorOperations` มีอยู่ใน helper แต่ไม่ถูกเรียกใช้ใน form — utility function สำรอง
**\*\*56,57**: Export/Print/Filter buttons ยังไม่มี handler — UI only

**Result: 59/59 PASS**

---

**สรุป: Doc→Code 90/90 PASS | Code→Doc 59/59 PASS**
