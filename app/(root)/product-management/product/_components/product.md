# Product Form - Functional Specification

## 1. Overview

FormProduct เป็น form หลักสำหรับจัดการข้อมูลสินค้า (Product) รองรับ 3 modes: **ADD**, **EDIT**, **VIEW**

---

## 2. Form Modes & Mode Transitions

| Mode | Entry Point | Buttons Shown | Fields State |
|------|-------------|---------------|--------------|
| **ADD** | `/product/new` | Cancel, Save | Editable |
| **VIEW** | `/product/[id]` | Back, Edit | Disabled (bg-muted) |
| **EDIT** | Click "Edit" in VIEW | Cancel, Save, Delete | Editable |

### Mode Transition Flow

```
ADD  ──(save success)──→  VIEW  (redirect to /product/{resultId})
ADD  ──(cancel)─────────→  List  (redirect to /product)

VIEW ──(edit click)─────→  EDIT
VIEW ──(cancel)─────────→  List  (redirect to /product)

EDIT ──(save success)──→  VIEW  (stay on same page)
EDIT ──(cancel)─────────→  VIEW  (revert to view mode)
EDIT ──(delete success)─→  List  (redirect to /product)
```

---

## 3. UI Layout

### 3.1 Header

```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]  {CODE} - {NAME}  [Active Badge]      [Edit]      │  ← VIEW mode
│ [← Back]  "Add Product" / "Edit Product"  [Cancel][Save][Delete] │  ← ADD/EDIT mode
└─────────────────────────────────────────────────────────────┘
```

- **Back button**: ใช้ `returnUrl` query param ถ้ามี, ไม่งั้นกลับ `/product-management/product`
- **Delete button**: แสดงเฉพาะ mode=EDIT เท่านั้น
- **Save button**: disabled เมื่อ `isFormValid = false` (ตรวจ name, code, local_name, inventory_unit_id, product_item_group_id ว่ามีค่าหรือไม่)

### 3.2 Basic Info Fields (Grid 3 columns)

| Field | Type | Required | Max Length | Mode Behavior |
|-------|------|----------|------------|---------------|
| Product Code (`code`) | InputValidate | Yes | 10 | VIEW: disabled + bg-muted |
| Product Name (`name`) | InputValidate | Yes | 100 | VIEW: disabled + bg-muted |
| Local Name (`local_name`) | InputValidate | Yes | 100 | VIEW: disabled + bg-muted |
| Item Group (`product_item_group_id`) | LookupItemGroup | Yes | - | VIEW: disabled + bg-muted |
| Sub Category | Input (readonly) | No (auto-fill) | - | Always disabled + bg-muted |
| Category | Input (readonly) | No (auto-fill) | - | Always disabled + bg-muted |
| Inventory Unit (`inventory_unit_id`) | UnitLookup | Yes | - | VIEW: disabled + bg-muted |
| Tax Profile (`product_info.tax_profile_id`) | LookupTaxProfile | No | - | VIEW: disabled + bg-muted |
| Order Unit (display) | Input (readonly) | No (auto-display) | - | Always disabled, shows default order unit name |
| Description (`description`) | TextareaValidate | No | 256 | VIEW: disabled + bg-muted, col-span-full |

### 3.3 Auto-fill Logic (เมื่อเลือก Item Group)

เมื่อเลือก Item Group จะ auto-fill fields ต่อไปนี้:

1. `product_category` → จาก item group
2. `product_sub_category` → จาก item group
3. `product_info.price_deviation_limit` → จาก item group
4. `product_info.qty_deviation_limit` → จาก item group
5. `product_info.is_used_in_recipe` → จาก item group
6. `product_info.is_sold_directly` → จาก item group
7. `product_info.tax_profile_id` → จาก item group (ถ้ามี)
8. `product_info.tax_profile_name` → จาก item group
9. `product_info.tax_rate` → จาก item group
10. `product_item_group` → `{ id, name }`

Category/SubCategory ยัง fetch ผ่าน API เมื่อ `product_item_group_id` เปลี่ยนแปลง (cache 5 นาที)

### 3.4 Default Order Unit Display

แสดง from_unit_name ของ order unit ที่ `is_default = true` (ถ้ามี)
- ค้นหาจาก: `order_units.add[]` + `order_units.data[]` (ลบ removed, merge updates)
- ถ้าไม่มี default → แสดงข้อความ "No order unit set"

### 3.5 Tabs

```
┌──────────┬───────────┬────────────┬─────────────────┐
│ General  │ Location  │ Order Unit │ Ingredient Unit  │
└──────────┴───────────┴────────────┴─────────────────┘
```

---

## 4. Tab: General (Product Attribute)

### 4.1 Fixed Fields

| Field | Type | Min | Max | Suffix | View Mode |
|-------|------|-----|-----|--------|-----------|
| Price (`product_info.price`) | NumberInput | 0 | - | - | disabled |
| Price Deviation Limit (`product_info.price_deviation_limit`) | NumberInput | 0 | 100 | % | disabled |
| Qty Deviation Limit (`product_info.qty_deviation_limit`) | NumberInput | 0 | 100 | % | disabled |
| Barcode (`product_info.barcode`) | InputValidate | 6 chars | 100 chars | - | disabled |

### 4.2 Boolean Flags (Checkboxes)

| Field | Default | View Mode |
|-------|---------|-----------|
| Used in Recipe (`product_info.is_used_in_recipe`) | false | disabled |
| Sold Directly (`product_info.is_sold_directly`) | false | disabled |

### 4.3 Dynamic Attributes (`product_info.info[]`)

- **Add**: กดปุ่ม "+" เพิ่ม row ใหม่ `{ label: "", value: "", data_type: "string" }`
- **Edit Mode**: แต่ละ row = `[Select Label dropdown]` + `[Input Value]` + `[Delete icon]`
- **View Mode**: แต่ละ row = Label (bold) + Value (muted), grid 2 columns
- **ถ้าไม่มี attribute**: แสดงข้อความ "No attributes added"
- **Available Labels** (15 ตัวเลือก): allergens, calories, serving_size, storage, shelf_life, brand, color, size, weight, dimensions, material, country_of_origin, voltage, wattage, warranty

---

## 5. Tab: Location

### 5.1 UI Structure

```
┌──────────────────────────────────────────────────┐
│ Location   [Search]                         [+]  │
├──────────────────────────────────────────────────┤
│ Location Name | Type | Delivery Point | Status | Action │
│ (Select/Link) | text | text           | badge  | 🗑️    │
└──────────────────────────────────────────────────┘
```

- ปุ่ม "+" ซ่อนเมื่อ mode=VIEW
- ปุ่ม Action column ซ่อนเมื่อ mode=VIEW

### 5.2 Data Management Pattern

- **data[]**: existing locations จาก API (ใช้อ้างอิง)
- **add[]**: new locations ที่ user เพิ่ม (เพิ่มข้างบนสุดของตาราง)
- **remove[]**: existing locations ที่ user ลบ (เก็บ id)

### 5.3 Display Logic

- แสดง = `add[]` (new rows, ด้านบน) + `data[]` ที่ไม่อยู่ใน `remove[]`
- **New row**: แสดง Select dropdown เพื่อเลือก location
- **Existing row**: แสดง Link ไปหน้า `/configuration/location/{id}`
- **Search**: filter ตาม name, description, delivery_point.name, location_type

### 5.4 Location Filtering ตาม Product Type

เมื่อมีข้อมูล product:

| เงื่อนไข | Location ที่แสดงใน dropdown |
|-----------|---------------------------|
| Category = "Fixed Assets" | เฉพาะ location_type = "inventory" |
| is_used_in_recipe = true | เฉพาะ location_type = "inventory" |
| is_sold_directly = true | location_type in ["direct", "consignment", "inventory"] |
| อื่นๆ | ทุก location ที่ is_active = true |

### 5.5 Available Locations

Locations ใน dropdown = ทั้งหมด (ผ่าน filter ข้างบน) **ลบ** locations ที่ถูกเลือกแล้ว (existing + new)

### 5.6 Delete Behavior

| ประเภท Row | Behavior |
|-----------|----------|
| New row (เพิ่งเพิ่ม) | ลบทันทีจาก add[] (ไม่มี confirm) |
| Existing row (จาก API) | แสดง DeleteConfirmDialog → เพิ่มเข้า remove[] |

---

## 6. Tab: Order Unit

### 6.1 UI Structure

```
┌────────────────────────────────────────────────────────┐
│ Order Unit                                       [+]   │
├────────────────────────────────────────────────────────┤
│ Order Unit | To Inventory Unit | Default | Conversion | Action │
│ [qty][unit]| [qty][unit]       | ☐       | preview    | 🗑️    │
└────────────────────────────────────────────────────────┘
```

- ปุ่ม "+" ซ่อนเมื่อ mode=VIEW
- ปุ่ม "+" disabled เมื่อยังไม่ได้เลือก Inventory Unit

### 6.2 Data Management Pattern

- **data[]**: existing units จาก API
- **add[]**: new units ที่ user เพิ่ม
- **update[]**: existing units ที่ถูกแก้ไข (track by `product_order_unit_id`)
- **remove[]**: existing units ที่ถูกลบ (track by `product_order_unit_id`)

### 6.3 เมื่อกดเพิ่ม Order Unit ใหม่

```
from_unit_id:   ""                 ← user เลือกจาก Combobox
from_unit_qty:  1                  ← fixed, disabled
to_unit_id:     [inventory_unit]   ← auto-set เป็น inventory unit (readonly)
to_unit_qty:    1                  ← user แก้ได้ (min: 1)
is_active:      true
is_default:     false
```

### 6.4 Column Behaviors ตาม Mode

| Column | New Row (ADD/EDIT) | Existing Row (EDIT) | VIEW Mode |
|--------|-------------------|---------------------|-----------|
| Order Unit (from) | qty=disabled, unit=UnitCombobox | qty=disabled, unit=UnitCombobox | text only |
| To Inventory Unit (to) | NumberInput(min:1), unit=readonly | NumberInput(min:1), unit=readonly | text only |
| Default | Checkbox | Checkbox | Checkbox disabled |
| Conversion | Live preview | Live preview | Live preview |
| Action | Trash (ลบทันที) | Trash (confirm dialog) | hidden |

### 6.5 Default Checkbox Logic (Radio-like behavior)

เมื่อ check default บน unit หนึ่ง:
1. **Uncheck ทุก unit อื่น** (ทั้ง data[] และ add[])
2. **Check unit ที่เลือก**
3. สร้าง update records สำหรับ existing units ที่ถูก uncheck (เพื่อส่งให้ API)
4. เมื่อ uncheck → ไม่ทำอะไร (ต้อง check unit อื่นแทน)

### 6.6 Auto-sync Logic

- ถ้า `from_unit_id === to_unit_id` → auto-set `to_unit_qty = from_unit_qty`
- ถ้า `to_unit_qty === 0` → auto-set เป็น `1`

### 6.7 Auto-add Default Order Unit เมื่อ Submit

ถ้า submit แล้วไม่มี order unit เลย (data + add ว่างเปล่า):
→ ระบบจะสร้าง default order unit อัตโนมัติ:
```
from_unit_id:   inventory_unit_id
from_unit_qty:  1
to_unit_id:     inventory_unit_id
to_unit_qty:    1
is_active:      true
is_default:     false
```

### 6.8 Row Styling

| ประเภท Row | สี Background |
|-----------|--------------|
| New (เพิ่งเพิ่ม) | `bg-green-50` |
| Existing (จาก API) | `bg-amber-50` |

### 6.9 Empty State

- ถ้ายังไม่ได้เลือก Inventory Unit → "Please select order unit"
- ถ้าเลือกแล้วแต่ไม่มี unit → "No order units defined"

---

## 7. Tab: Ingredient Unit

### 7.1 UI Structure

```
┌──────────────────────────────────────────────────────────┐
│ Ingredient Unit                                    [+]   │
├──────────────────────────────────────────────────────────┤
│ Inventory Unit | Ingredient Unit | Default | Conversion | Action │
│ [qty][unit]    | [qty][unit]     | ☐       | preview    | 🗑️    │
└──────────────────────────────────────────────────────────┘
```

### 7.2 เมื่อกดเพิ่ม Ingredient Unit ใหม่ (สลับกับ Order Unit)

```
from_unit_id:   [inventory_unit]   ← auto-set เป็น inventory unit (readonly)
from_unit_qty:  1                  ← fixed, disabled
to_unit_id:     ""                 ← user เลือกจาก Combobox
to_unit_qty:    1                  ← user แก้ได้
is_active:      true
is_default:     false
```

### 7.3 ความแตกต่างจาก Order Unit

| Aspect | Order Unit | Ingredient Unit |
|--------|-----------|-----------------|
| From unit | User เลือก (UnitCombobox) | Fixed = inventory unit (readonly) |
| To unit | Fixed = inventory unit (readonly) | User เลือก (UnitCombobox) |
| Column header (from) | "Order Unit" | "Inventory Unit" |
| Column header (to) | "To Inventory Unit" | "Ingredient Unit" |

### 7.4 เงื่อนไขปุ่ม "+" (Add)

ปุ่ม "+" disabled เมื่อ:
- ยังไม่ได้เลือก Inventory Unit (`!inventoryUnitId`)
- **หรือ** `is_used_in_recipe === false` (ต้อง check "Used in Recipe" ก่อน)

### 7.5 Data Management

เหมือน Order Unit แต่ใช้ `product_ingredient_unit_id` แทน `product_order_unit_id` สำหรับ update/remove

---

## 8. Conversion Preview

- แสดง real-time formula: `{fromQty} {fromUnitName} = {toQty} {toUnitName}`
- Subscribe ค่าจาก form แบบ live (useWatch)
- แสดงเฉพาะเมื่อทั้ง fromUnitId และ toUnitId มีค่า
- ถ้ายังไม่ครบ → ไม่แสดงอะไร

---

## 9. Validation Rules

### 9.1 Required Fields

| Field | Zod Rule | Error Message |
|-------|----------|---------------|
| `name` | `string().min(1)` | "Name is required" |
| `code` | `string().min(1)` | "Code is required" |
| `local_name` | `string().min(1)` | "Local name is required" |
| `inventory_unit_id` | `string().uuid()` | (uuid format error) |
| `product_item_group_id` | `string().uuid()` | (uuid format error) |
| `product_status_type` | `literal("active")` | Must be "active" |

### 9.2 Product Info Validation

| Field | Rule |
|-------|------|
| `product_info.is_used_in_recipe` | `boolean()` required |
| `product_info.is_sold_directly` | `boolean()` required |
| `product_info.is_ingredients` | `boolean()` required |
| `product_info.barcode` | `string().min(6).max(100)` optional |
| `product_info.price` | `number()` optional |
| `product_info.price_deviation_limit` | `number()` optional |
| `product_info.qty_deviation_limit` | `number()` optional |
| `product_info.tax_type` | `enum(["none", "included", "excluded"])` default "none" |
| `product_info.tax_rate` | `number()` optional |
| `product_info.tax_profile_id` | `string()` required |
| `product_info.tax_profile_name` | `string()` required |
| `product_info.info[]` | `array({ label: string, value: string, data_type: string })` |

### 9.3 Unit Validation (order_units / ingredient_units)

| Array | Field | Rule |
|-------|-------|------|
| `.add[]` | `from_unit_qty` | `number().min(1)` - "must be >= 1" |
| `.add[]` | `to_unit_qty` | `number().min(1)` - "must be >= 1" |
| `.update[]` | `from_unit_qty` | `number().min(1)` |
| `.update[]` | `to_unit_qty` | `number().min(1)` |
| `.add[]` (order) | `from_unit_id`, `to_unit_id` | `string().uuid()` strict |
| `.add[]` (ingredient) | `from_unit_id`, `to_unit_id` | `string().uuid()` หรือ `""` (อนุญาตว่าง) |

### 9.4 Location Validation

| Field | Rule |
|-------|------|
| `locations.add[].location_id` | `string().uuid()` |
| `locations.remove[].id` | `string().uuid()` optional array |

### 9.5 UI-Level Validation (ปุ่ม Save)

ปุ่ม Save disabled เมื่อ **อย่างใดอย่างหนึ่ง** เป็น falsy:
- `name`
- `code`
- `local_name`
- `inventory_unit_id`
- `product_item_group_id`

### 9.6 Form Invalid Handler

เมื่อ submit แล้ว Zod validation fail → toast error: **"กรุณากรอกข้อมูลให้ครบถ้วน"**

---

## 10. Submit & API Logic

### 10.1 Data Transform ก่อน Submit

ตัดฟิลด์ display-only ออก:
- `product_category`, `product_sub_category`, `product_item_group` → ไม่ส่ง
- `locations.data` → ไม่ส่ง (ส่งเฉพาะ add/remove)
- `order_units.data` → ไม่ส่ง (ส่งเฉพาะ add/update/remove)
- `ingredient_units.data` → ไม่ส่ง (ส่งเฉพาะ add/update/remove)

Transform remove arrays:
- `locations.remove[].id` → `{ product_location_id: id }`
- `order_units.remove[].product_order_unit_id` → `{ product_order_unit_id }`
- `ingredient_units.remove[].product_ingredient_unit_id` → `{ product_ingredient_unit_id }`

### 10.2 CREATE (mode=ADD)

- API: `POST /api/config/{buCode}/products`
- Success:
  - Toast: "add_success"
  - Mode → VIEW
  - Redirect to `/product/{resultId}` (ถ้าได้ id กลับมา) หรือ `/product` (ถ้าไม่มี)
  - Invalidate: `["products", buCode]`
- Error: Toast "add_error"

### 10.3 UPDATE (mode=EDIT)

- Pre-check: `id` ต้องมี → ถ้าไม่มี toast "Product ID is required for update"
- API: `PATCH /api/config/{buCode}/products/{id}`
- Success:
  - Toast: "edit_success"
  - Mode → VIEW (stay on same page)
  - Invalidate: `["products", buCode]` + `["product", buCode, id]`
- Error: Toast "edit_error"

### 10.4 DELETE

- Trigger: กดปุ่ม Delete → เปิด DeleteConfirmDialog
- Pre-check: `id` ต้องมี
- API: `DELETE /api/config/{buCode}/products/{id}`
- Success:
  - Toast: "delete_success"
  - Invalidate: `["products", buCode]`
  - Remove cache: `["product", buCode, id]`
  - Redirect to `/product-management/product`
- Error: Toast "delete_error"

---

## 11. Initial Values

### 11.1 New Product (ไม่มี initialValues)

| Type | Default |
|------|---------|
| strings | `""` |
| numbers | `0` |
| booleans | `false` |
| arrays | `[]` |
| `product_status_type` | `"active"` |
| `product_info.tax_type` | `"none"` |

### 11.2 Edit/View Product (มี initialValues)

- รองรับ **nested format** (`product_info.price`) และ **flat format** (`price`) สำหรับ backward compatibility
- Priority: `initialValues.product_info?.field ?? initialValues.field ?? default`
- locations/order_units/ingredient_units ถูก map จาก flat array → `{ data: [...], add: [], update: [], remove: [] }`
- เมื่อ initialValues เปลี่ยน → form.reset() ด้วยค่าใหม่

---

## 12. Symmetric Cross-Recheck

### 12.1 Doc → Code (ทุกข้อในเอกสารตรงกับ code จริง?)

| # | Doc Item | Verified Location | Status |
|---|----------|-------------------|--------|
| 1 | Mode enum: ADD, EDIT, VIEW | `form.dto.ts:1-5` | PASS |
| 2 | ADD entry: `/new` with mode=ADD | `new/page.tsx:10` | PASS |
| 3 | VIEW entry: `/[id]` with mode=VIEW | `[id]/page.tsx:29` | PASS |
| 4 | VIEW→EDIT transition via handleEditClick | `FormProduct.tsx:303-307` | PASS |
| 5 | Save button disabled when !isFormValid | `BasicInfo.tsx:268-271` | PASS |
| 6 | isFormValid checks 5 fields (name, code, local_name, inventory_unit_id, item_group_id) | `BasicInfo.tsx:162-166` | PASS |
| 7 | Cancel in ADD/VIEW → redirect to list | `FormProduct.tsx:313-314` | PASS |
| 8 | Cancel in EDIT → back to VIEW | `FormProduct.tsx:315-316` | PASS |
| 9 | Delete button only in EDIT mode | `BasicInfo.tsx:276-285` | PASS |
| 10 | Code maxLength=10 | `BasicInfo.tsx:307` | PASS |
| 11 | Name maxLength=100 | `BasicInfo.tsx:328` | PASS |
| 12 | Local Name maxLength=100 | `BasicInfo.tsx:348` | PASS |
| 13 | Description maxLength=256 | `BasicInfo.tsx:510` | PASS |
| 14 | Item Group auto-fills 10 fields | `BasicInfo.tsx:168-210` | PASS |
| 15 | Sub Category/Category readonly with tooltip | `BasicInfo.tsx:385-431` | PASS |
| 16 | Zod: name min(1) | `product-form.schema.ts:6` | PASS |
| 17 | Zod: code min(1) | `product-form.schema.ts:7` | PASS |
| 18 | Zod: local_name min(1) | `product-form.schema.ts:11` | PASS |
| 19 | Zod: inventory_unit_id uuid | `product-form.schema.ts:8` | PASS |
| 20 | Zod: product_item_group_id uuid | `product-form.schema.ts:9` | PASS |
| 21 | Zod: barcode min(6).max(100) optional | `product-form.schema.ts:17-21` | PASS |
| 22 | Zod: order unit qty min(1) | `product-form.schema.ts:72,74` | PASS |
| 23 | Zod: ingredient allows empty string for unit ids | `product-form.schema.ts:121` | PASS |
| 24 | Price NumberInput min=0 | `ProductAttribute.tsx:103` | PASS |
| 25 | Price Deviation max=100 | `ProductAttribute.tsx:123` | PASS |
| 26 | Qty Deviation max=100 | `ProductAttribute.tsx:141` | PASS |
| 27 | Barcode minLength=6, maxLength=100 | `ProductAttribute.tsx:165-166` | PASS |
| 28 | is_used_in_recipe checkbox | `ProductAttribute.tsx:175-191` | PASS |
| 29 | is_sold_directly checkbox | `ProductAttribute.tsx:193-209` | PASS |
| 30 | 15 attribute labels | `ProductAttribute.tsx:23-39` | PASS |
| 31 | Attribute add default: label="", value="", data_type="string" | `ProductAttribute.tsx:56` | PASS |
| 32 | Location uses prepend (new rows on top) | `LocationInfo.tsx:79-86` | PASS |
| 33 | Location existing delete → confirm → remove[] | `LocationInfo.tsx:88-91, 444-456` | PASS |
| 34 | Location filter: Fixed Assets → inventory only | `LocationInfo.tsx:97-98` | PASS |
| 35 | Location filter: is_used_in_recipe → inventory only | `LocationInfo.tsx:100-101` | PASS |
| 36 | Location filter: is_sold_directly → direct/consignment/inventory | `LocationInfo.tsx:103-106` | PASS |
| 37 | Location search filter logic | `LocationInfo.tsx:180-197` | PASS |
| 38 | New location → Select, Existing → Link | `LocationInfo.tsx:212-255` | PASS |
| 39 | Order unit add defaults (from=combobox, to=inventory) | `use-unit-form.ts:355-366` | PASS |
| 40 | Ingredient unit add defaults (from=inventory, to=combobox) | `use-unit-form.ts:367-375` | PASS |
| 41 | Default checkbox radio-like behavior | `use-unit-form.ts:168-277` | PASS |
| 42 | Auto-add default order unit on empty submit | `FormProduct.tsx:216-233` | PASS |
| 43 | New row bg-green-50, existing row bg-amber-50 | `OrderUnit.tsx:141-143, 161` | PASS |
| 44 | Ingredient add disabled when isUseinRecipe=false | `UnitCard.tsx:51` | PASS |
| 45 | Order/Ingredient add disabled when !inventoryUnitId | `OrderUnit.tsx:152` `IngredientUnit.tsx:133` | PASS |
| 46 | CREATE → POST, toast, redirect | `FormProduct.tsx:259-279` | PASS |
| 47 | UPDATE → PATCH, requires id | `FormProduct.tsx:280-298` | PASS |
| 48 | DELETE → confirm dialog, redirect | `FormProduct.tsx:322-349` | PASS |
| 49 | onInvalid toast "กรุณากรอกข้อมูลให้ครบถ้วน" | `FormProduct.tsx:351-353` | PASS |
| 50 | product_status_type forced "active" on init | `BasicInfo.tsx:74-79` | PASS |
| 51 | ConversionPreview shows only when both units set | `ConversionPreviewWatcher.tsx:56-67` | PASS |
| 52 | Back button uses returnUrl searchParam | `BasicInfo.tsx:212-218` | PASS |
| 53 | API staleTime = 5 min | `use-product.ts:44,57,76-77` | PASS |
| 54 | Delete removes query cache | `use-product.ts:141` | PASS |
| 55 | Update uses PATCH method | `use-product.ts:116` | PASS |
| 56 | Auto-sync: same unit → same qty | `OrderUnit.tsx:62-78` | PASS |
| 57 | form.reset when initialValues change | `FormProduct.tsx:199-201` | PASS |

### 12.2 Code → Doc (ทุก feature ใน code ถูกครอบคลุมในเอกสาร?)

| # | Code Feature | Documented In |
|---|-------------|---------------|
| 1 | formType enum (ADD/EDIT/VIEW) | Section 2 |
| 2 | ProductFormValues interface | Section 9 |
| 3 | ProductInitialValues backward compat (nested + flat) | Section 11.2 |
| 4 | Zod productFormSchema (all fields) | Section 9 |
| 5 | FormProduct state: mode, deleteDialog, mutations | Section 2, 10 |
| 6 | transformInitialValues mapping | Section 11 |
| 7 | onSubmit data transform (strip display-only fields) | Section 10.1 |
| 8 | Auto-add order unit when empty on submit | Section 6.7 |
| 9 | Delete with confirm dialog | Section 10.4 |
| 10 | BasicInfo: header, buttons, all form fields | Section 3.1, 3.2 |
| 11 | Item Group auto-fill cascade (10 fields) | Section 3.3 |
| 12 | Default order unit display in header | Section 3.4 |
| 13 | ProductAttribute: price, deviation limits, barcode | Section 4.1 |
| 14 | ProductAttribute: is_used_in_recipe, is_sold_directly | Section 4.2 |
| 15 | ProductAttribute: dynamic attributes with PRODUCT_LABELS | Section 4.3 |
| 16 | AttributeItem: view mode (label+value) / edit mode (select+input+delete) | Section 4.3 |
| 17 | LocationInfo: add/remove/display logic | Section 5 |
| 18 | Location filtering by product type (Fixed Assets, recipe, sold directly) | Section 5.4 |
| 19 | Location search (name, description, delivery_point, type) | Section 5.3 |
| 20 | Location delete: new=immediate, existing=confirm dialog | Section 5.6 |
| 21 | OrderUnit: full lifecycle (add/edit/remove/default) | Section 6 |
| 22 | IngredientUnit: full lifecycle with swapped from/to | Section 7 |
| 23 | UnitCard: shared component (add button, empty state, table) | Section 6.1, 6.9, 7.1 |
| 24 | ConversionPreviewWatcher: live formula display | Section 8 |
| 25 | useUnitManagement: CRUD state (data/add/update/remove) | Section 6.2, 7.5 |
| 26 | useUnitForm: field array, getAvailableUnits, handleDefaultChange, handleFieldChange | Section 6.3-6.6, 7.2-7.4 |
| 27 | useUnitColumns: table column definitions per mode | Section 6.4 |
| 28 | useProductDetail: fetch by ID, login dialog on error | Section 2 (via page reference) |
| 29 | StockInventLocation: stock display component | Not in form flow (standalone display) |
| 30 | API hooks: CRUD + category lookup | Section 10, 3.3 |
| 31 | isUseinRecipe disables ingredient unit add button | Section 7.4 |
| 32 | form.reset on initialValues change | Section 11.2 |
| 33 | Order unit auto-sync (same from/to unit → same qty) | Section 6.6 |
| 34 | Row styling: green-50 new, amber-50 existing | Section 6.8 |

### 12.3 Summary

| Direction | Total | Pass | Fail |
|-----------|-------|------|------|
| Doc → Code | 57 | 57 | 0 |
| Code → Doc | 34 | 34 | 0 |

**Cross-recheck result: PASS** - เอกสารครอบคลุมและตรงกับ code ทั้งหมด
