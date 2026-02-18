# Transfer - Location & Department

## 1. Transfer คืออะไร

Transfer เป็น pattern ที่ใช้จัดการ **many-to-many relationship** ระหว่าง entity หลัก (Location/Department) กับ entity ย่อย (Users/Products) โดยใช้ระบบ `{ add: [], remove: [] }` เพื่อส่ง diff ไปให้ API

---

## 2. Location Transfer

### 2.1 Transfer ที่มีใน Location

| Transfer | Data Source | Pattern |
|----------|-----------|---------|
| Users | `GET /api/{buCode}/users` → map เป็น `{ key: user_id, title: fullname }` | Transfer component (2-panel) |
| Products | `GET /api/config/{buCode}/products?perpage=-1` → build tree | TreeProductLookup (tree/list + selected panel) |

### 2.2 Users Transfer

**Data Source:**
- ดึง user list จาก `GET /api/{buCode}/users`
- Map เป็น `{ key: user_id, title: "firstname lastname" }`

**Initial Values (Edit mode):**
- จาก `initialData.user_location[]` → map เป็น `{ key: id, title: "firstname lastname" }`

**Transfer Handler Logic (TransferHandler):**

เมื่อ user ย้าย items ระหว่าง panel:

| Action | Direction | Logic |
|--------|-----------|-------|
| ย้าย user เข้า (เพิ่ม) | `right` → ตรวจว่าอยู่ใน remove[] ไหม | ถ้าอยู่ใน remove[] → ลบออกจาก remove[] (cancel removal), ถ้าไม่อยู่ → เพิ่มเข้า add[] |
| ย้าย user ออก (ลบ) | `left` → ตรวจว่าอยู่ใน add[] ไหม | ถ้าอยู่ใน add[] → ลบออกจาก add[] (cancel addition), ถ้าไม่อยู่ → เพิ่มเข้า remove[] |

**ข้อมูลที่ส่งใน form:**
```
users: {
  add: [{ id: "user_id_1" }, { id: "user_id_2" }],
  remove: [{ id: "user_id_3" }]
}
```

### 2.3 Products Transfer

**Data Source:**
- ดึง product list จาก `GET /api/config/{buCode}/products?perpage=-1`
- สร้าง tree structure: Category → Sub Category → Item Group → Product

**Initial Values (Edit mode):**
- จาก `initialData.product_location[]` → map เป็น `{ key: id, title: name }`

**Selection Logic (TreeProductLookup):**

เมื่อ user เลือก/ยกเลิก products:

| Action | Logic |
|--------|-------|
| Select product | เพิ่ม `product-{id}` เข้า selectedIds Set + cache item data |
| Unselect product | ลบ `product-{id}` ออกจาก selectedIds Set |
| Select group (category/subcategory/item group) | เพิ่ม product ทั้งหมดใน group เข้า selectedIds |
| Unselect group | ลบ product ทั้งหมดใน group ออกจาก selectedIds |

**Diff Calculation (handleTreeProductSelect):**
```
เปรียบเทียบ selectedProductIds กับ initialProductIds:
- toAdd = selectedIds ที่ไม่อยู่ใน initialIds → products.add[]
- toRemove = initialIds ที่ไม่อยู่ใน selectedIds → products.remove[]
```

**ข้อมูลที่ส่งใน form:**
```
products: {
  add: [{ id: "product_id_1" }],
  remove: [{ id: "product_id_2" }]
}
```

### 2.4 Location API

| Action | Method | URL | Body (transfer part) |
|--------|--------|-----|---------------------|
| Create | POST | `/api/config/{buCode}/locations` | `{ ...fields, users: { add, remove }, products: { add, remove } }` |
| Update | PATCH | `/api/config/{buCode}/locations/{id}` | `{ ...fields, users: { add, remove }, products: { add, remove } }` |

**Query Invalidation หลัง Create/Update:**
- `["locations", buCode]`
- `["location", buCode, id]` (update only)
- `["users"]`
- `["products"]`

---

## 3. Department Transfer

### 3.1 Transfer ที่มีใน Department

| Transfer | Data Source | Filter | Pattern |
|----------|-----------|--------|---------|
| Department Users | `GET /api/{buCode}/users` | เฉพาะ user ที่ **ยังไม่มี department** (`!user.department?.id`) | Transfer component |
| HOD Users | `GET /api/{buCode}/users` | ทุก user (ไม่ filter) | Transfer component |

### 3.2 Department Users Transfer

**Data Source:**
- ดึง user list จาก `GET /api/{buCode}/users`
- **Filter**: เฉพาะ user ที่ `!user.department?.id` (ยังไม่ถูก assign ให้ department ใด)
- Map เป็น `{ key: user_id, title: "firstname lastname" }`

**Initial Values (Edit mode):**
- จาก `defaultValues.department_users[]` → map เป็น `{ key: user_id, title: "firstname lastname" }`

**Transfer Handler Logic:**
เหมือน Location Users Transfer (ใช้ TransferHandler ตัวเดียวกัน)

**ข้อมูลที่ส่งใน form:**
```
department_users: {
  add: [{ id: "user_id_1" }],
  remove: [{ id: "user_id_2" }]
}
```

### 3.3 HOD Users Transfer

**Data Source:**
- ดึง user list จาก `GET /api/{buCode}/users`
- **ไม่ filter** → ทุก user สามารถเป็น HOD ได้
- Map เป็น `{ key: user_id, title: "firstname lastname" }`

**Initial Values (Edit mode):**
- จาก `defaultValues.hod_users[]` → map เป็น `{ key: user_id, title: "firstname lastname" }`

**ข้อมูลที่ส่งใน form:**
```
hod_users: {
  add: [{ id: "user_id_1" }],
  remove: [{ id: "user_id_2" }]
}
```

### 3.4 Department API

| Action | Method | URL | Body (transfer part) |
|--------|--------|-----|---------------------|
| Create | POST | `/api/config/{buCode}/departments/` | `{ ...fields, department_users: { add, remove }, hod_users: { add, remove } }` |
| Update | PATCH | `/api/config/{buCode}/departments/{id}` | `{ ...fields, department_users: { add, remove }, hod_users: { add, remove } }` |
| Delete | DELETE | `/api/config/{buCode}/departments/{id}` | - |

**Query Invalidation:**

| Action | Invalidate Keys |
|--------|----------------|
| Create | `["departments", buCode]` |
| Update | `["department-id", id]` + `["departments", buCode]` |
| Delete | `["departments", buCode]` |

---

## 4. TransferHandler - Shared Logic

TransferHandler เป็น function ที่ใช้ร่วมกันทั้ง Location (users) และ Department (department_users, hod_users)

### 4.1 Parameters

```
form: UseFormReturn       // react-hook-form instance
fieldName: string         // "users" | "department_users" | "hod_users"
setSelected: setState     // update selected keys ใน local state
```

### 4.2 Algorithm

```
Input: targetKeys (ผลลัพธ์ทั้งหมดหลังย้าย), direction ("left"|"right"), moveKeys (items ที่ถูกย้าย)

สำหรับแต่ละ key ที่ถูกย้าย:
┌─────────────────────────────────────────────────────────────┐
│ direction = "right" (เพิ่ม item เข้า selected)              │
│   ├─ อยู่ใน remove[] → ลบออกจาก remove[] (undo removal)    │
│   └─ ไม่อยู่ใน add[]  → เพิ่มเข้า add[] (new addition)     │
│                                                             │
│ direction = "left" (ลบ item ออกจาก selected)                │
│   ├─ อยู่ใน add[]    → ลบออกจาก add[] (undo addition)      │
│   └─ ไม่อยู่ใน remove[] → เพิ่มเข้า remove[] (new removal) │
└─────────────────────────────────────────────────────────────┘

สุดท้าย: setValue(`${fieldName}.add`, newAddArray)
         setValue(`${fieldName}.remove`, newRemoveArray)
```

### 4.3 ตัวอย่าง Flow

สมมติ Department มี users เริ่มต้น: [A, B, C]

| Step | Action | add[] | remove[] | Selected |
|------|--------|-------|----------|----------|
| 0 | Initial | [] | [] | [A, B, C] |
| 1 | ลบ C ออก (left) | [] | [{id: C}] | [A, B] |
| 2 | เพิ่ม D เข้า (right) | [{id: D}] | [{id: C}] | [A, B, D] |
| 3 | เพิ่ม C กลับ (right) | [{id: D}] | [] | [A, B, C, D] |
| 4 | ลบ D ออก (left) | [] | [] | [A, B, C] |

สังเกต: Step 3 → C อยู่ใน remove[] → ลบออกจาก remove[] (undo), Step 4 → D อยู่ใน add[] → ลบออกจาก add[] (undo)

---

## 5. Product Transfer - Diff Calculation (Location เท่านั้น)

ต่างจาก TransferHandler ตรงที่ TreeProductLookup ใช้วิธี diff เทียบกับ initial:

```
handleTreeProductSelect(productIds):
  currentProductIds = initialProductKeys (จาก API)
  newProductIds = productIds (จาก tree selection)

  toAdd = newProductIds.filter(id => !currentProductIds.includes(id))
  toRemove = currentProductIds.filter(id => !newProductIds.includes(id))

  form.setValue("products", { add: toAdd, remove: toRemove })
```

ข้อแตกต่าง:
- **TransferHandler** (users): คำนวณ add/remove แบบ incremental (ทีละ move)
- **TreeProductLookup** (products): คำนวณ add/remove แบบ snapshot (เทียบ current vs initial ทุกครั้ง)

---

## 6. Symmetric Cross-Recheck

### 6.1 Doc → Code

| # | Doc Item | Verified Location | Status |
|---|----------|-------------------|--------|
| 1 | Location users: Transfer component with add/remove | `LocationForm.tsx:431-439` | PASS |
| 2 | Location products: TreeProductLookup component | `LocationForm.tsx:443-449` | PASS |
| 3 | Location user data source: useUserList → map user_id + name | `LocationForm.tsx:68,74-77` | PASS |
| 4 | Location user initial: initialData.user_location map | `LocationForm.tsx:99-106` | PASS |
| 5 | Location product initial: initialData.product_location map | `LocationForm.tsx:108-115` | PASS |
| 6 | Location handleUsersChange = transferHandler | `LocationForm.tsx:163-167` | PASS |
| 7 | Location handleTreeProductSelect: diff current vs initial | `LocationForm.tsx:169-187` | PASS |
| 8 | Location form default: users/products = { add:[], remove:[] } | `LocationForm.tsx:138-145` | PASS |
| 9 | Location Create: POST /api/config/{buCode}/locations | `use-locations.ts:94-101` | PASS |
| 10 | Location Update: PATCH /api/config/{buCode}/locations/{id} | `use-locations.ts:107-124` | PASS |
| 11 | Location query invalidation: locations, location, users, products | `LocationForm.tsx:194-197` | PASS |
| 12 | Department users filter: !user.department?.id | `FormDepartment.tsx:91-100` | PASS |
| 13 | Department HOD: no filter (all users) | `FormDepartment.tsx:102-109` | PASS |
| 14 | Department users initial: defaultValues.department_users map | `FormDepartment.tsx:111-118` | PASS |
| 15 | Department HOD initial: defaultValues.hod_users map | `FormDepartment.tsx:120-127` | PASS |
| 16 | Department handleDepartmentUsersChange = transferHandler | `FormDepartment.tsx:178-182` | PASS |
| 17 | Department handleHodUsersChange = transferHandler | `FormDepartment.tsx:184-188` | PASS |
| 18 | Department form default: department_users/hod_users = { add:[], remove:[] } | `FormDepartment.tsx:146-153` | PASS |
| 19 | Department Create: POST /api/config/{buCode}/departments/ | `use-departments.ts:76-83` | PASS |
| 20 | Department Update: PATCH /api/config/{buCode}/departments/{id} | `use-departments.ts:85-92` | PASS |
| 21 | Department Delete: DELETE /api/config/{buCode}/departments/{id} | `use-departments.ts:94-101` | PASS |
| 22 | Department Create invalidation: ["departments", buCode] | `FormDepartment.tsx:226` | PASS |
| 23 | Department Update invalidation: ["department-id", id] + ["departments", buCode] | `FormDepartment.tsx:208-211` | PASS |
| 24 | Department Delete invalidation: ["departments", buCode] | `FormDepartment.tsx:246` | PASS |
| 25 | TransferHandler: right + in remove → delete from remove | `TransferHandler.tsx:33-36` | PASS |
| 26 | TransferHandler: right + not in add → add to add | `TransferHandler.tsx:38-41` | PASS |
| 27 | TransferHandler: left + in add → delete from add | `TransferHandler.tsx:43-46` | PASS |
| 28 | TransferHandler: left + not in remove → add to remove | `TransferHandler.tsx:48-50` | PASS |
| 29 | TreeProductLookup: diff-based (toAdd/toRemove vs initial) | `LocationForm.tsx:174-179` | PASS |
| 30 | TreeProductLookup: group select adds all products in group | `useProductSelection.ts:37-61` | PASS |
| 31 | Location form schema: users/products = { add:[], remove:[] } with id:string | `location-form.schema.ts:19-42` | PASS |
| 32 | Department form schema: department_users/hod_users = { add:[], remove:[] } with id:string | `department.dto.ts:13-16, 64-65` | PASS |

### 6.2 Code → Doc

| # | Code Feature | Documented In |
|---|-------------|---------------|
| 1 | Location users Transfer component | Section 2.2 |
| 2 | Location products TreeProductLookup | Section 2.3 |
| 3 | Location user data source + mapping | Section 2.2 |
| 4 | Location product data source + tree building | Section 2.3 |
| 5 | Location handleUsersChange (TransferHandler) | Section 2.2, 4 |
| 6 | Location handleTreeProductSelect (diff) | Section 2.3, 5 |
| 7 | Location API (POST/PATCH) | Section 2.4 |
| 8 | Location query invalidation | Section 2.4 |
| 9 | Department users filter (!department.id) | Section 3.2 |
| 10 | Department HOD no filter | Section 3.3 |
| 11 | Department users/HOD Transfer components | Section 3.2, 3.3 |
| 12 | Department handleDepartmentUsersChange | Section 3.2, 4 |
| 13 | Department handleHodUsersChange | Section 3.3, 4 |
| 14 | Department API (POST/PATCH/DELETE) | Section 3.4 |
| 15 | Department query invalidation | Section 3.4 |
| 16 | TransferHandler shared algorithm | Section 4 |
| 17 | TransferHandler incremental vs TreeProduct snapshot diff | Section 5 |
| 18 | TreeProductLookup group selection (select/unselect all in group) | Section 2.3 |
| 19 | Zod schema for location form (users/products add/remove) | Section 2.4 (implicit) |
| 20 | Zod schema for department form (dept_users/hod_users add/remove) | Section 3.4 (implicit) |

### 6.3 Summary

| Direction | Total | Pass | Fail |
|-----------|-------|------|------|
| Doc → Code | 32 | 32 | 0 |
| Code → Doc | 20 | 20 | 0 |

**Cross-recheck result: PASS**
