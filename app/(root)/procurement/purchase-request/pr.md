# Purchase Request Module

## Overview

Purchase Request (PR) module เป็นระบบจัดการใบขอซื้อ (Purchase Request) ภายในระบบ Procurement โดยรองรับตั้งแต่การสร้าง, แก้ไข, ส่งอนุมัติ, อนุมัติ/ปฏิเสธ ไปจนถึงการจัดซื้อ ระบบใช้ Workflow-based approval ที่สามารถกำหนด Stage ของการอนุมัติได้หลายขั้นตอน

---

## Directory Structure

```
purchase-request/
├── page.tsx                          # หน้ารายการ PR (List Page)
├── new/
│   └── page.tsx                      # หน้าสร้าง PR ใหม่
├── [bu_code]/[id]/
│   └── page.tsx                      # หน้ารายละเอียด PR (Detail/Edit Page)
├── pr.md                             # เอกสารนี้
├── _components/
│   ├── PurchaseRequestComponent.tsx   # Component หลักหน้ารายการ
│   ├── PurchaseRequestList.tsx        # แสดง PR แบบตาราง (List View)
│   ├── PurchaseRequestGrid.tsx        # แสดง PR แบบ Card (Grid View)
│   ├── FilterPurchaseRequest.tsx      # ตัวกรองข้อมูล PR
│   ├── SelectPrStatus.tsx             # Dropdown เลือกสถานะ PR
│   ├── DialogNewPr.tsx                # Dialog สร้าง PR ใหม่
│   ├── DialogPrtList.tsx              # Dialog เลือก PR Template
│   ├── PrtTable.tsx                   # ตาราง PR Template
│   ├── SharePrComponent.tsx           # Component แชร์ PR
│   ├── TransactionSummary.tsx         # สรุปรายการธุรกรรม
│   ├── MobileView.tsx                 # แสดงผลบนมือถือ
│   ├── UnitSelectCell.tsx             # Cell เลือกหน่วยสินค้า
│   ├── ErrorBoundary.tsx              # จับ Error ของ Component
│   └── form-pr/
│       ├── MainForm.tsx               # ฟอร์มหลักของ PR
│       ├── HeadForm.tsx               # ส่วนหัวฟอร์ม (Workflow, วันที่, ผู้ขอ, แผนก)
│       ├── ActionFields.tsx           # ปุ่ม Back, Edit, Cancel, Save, Print, Export, Share
│       ├── ActionButtons.tsx          # ปุ่ม Workflow Actions (Submit, Approve, Reject, etc.)
│       ├── PurchaseItemDataGrid.tsx   # ตารางรายการสินค้า
│       ├── PurchaseItemColumns.tsx    # คำจำกัด Column ของตารางสินค้า
│       ├── ExpandedContent.tsx        # เนื้อหาขยายของแถวในตาราง
│       ├── PurchaseRequestContext.tsx # Context Provider สำหรับ Form Logic
│       ├── WorkflowStep.tsx           # แสดงขั้นตอน Workflow แบบ Visual
│       ├── WorkflowHistory.tsx        # ประวัติ Workflow
│       ├── InventoryInfo.tsx          # ข้อมูลสินค้าคงคลัง
│       ├── InventoryProgress.tsx      # แสดง Progress ของสินค้าคงคลัง
│       ├── SelectWorkflowStage.tsx    # Dropdown เลือก Workflow Stage
│       ├── VendorComparison.tsx       # เปรียบเทียบ Vendor
│       ├── PrLabelItem.tsx            # Label แสดงข้อมูล PR
│       └── dialogs/
│           ├── ReviewStageDialog.tsx   # Dialog เลือก Stage สำหรับ Review
│           ├── CancelConfirmDialog.tsx # Dialog ยืนยันยกเลิก
│           ├── SelectAllDialog.tsx     # Dialog เลือกทั้งหมด
│           └── BulkActionDialog.tsx    # Dialog ดำเนินการแบบกลุ่ม
├── _hooks/
│   ├── use-main-form-logic.ts         # Hook หลักจัดการ Logic ของฟอร์ม
│   ├── use-purchase-item-management.ts# Hook จัดการรายการสินค้า (CRUD)
│   ├── use-pr-actions.ts             # Hook รวม Mutation ของ Workflow Actions
│   ├── use-purchase-item-table.ts    # Hook จัดการ UI ของตารางสินค้า
│   ├── use-workflow-stage.ts         # Hook ดึง Workflow Stages
│   ├── use-prev-workflow.ts          # Hook ดึง Previous Stages สำหรับ Review
│   ├── use-inventory-data.ts         # Hook ดึงข้อมูลสินค้าคงคลัง
│   └── use-error-handler.ts          # Hook จัดการ Error/Success Messages
├── _handlers/
│   ├── purchase-request-create.handlers.ts  # Handler สร้าง PR
│   ├── purchase-request-update.handlers.ts  # Handler แก้ไข PR
│   └── purchase-request-actions.handlers.ts # Handler Workflow Actions
├── _schemas/
│   └── purchase-request-form.schema.ts      # Zod Schemas สำหรับ Validation
├── _constants/
│   ├── pr-status.ts                  # ค่าคงที่สถานะ PR และ Item
│   └── error-messages.ts            # ข้อความ Error/Success
└── _utils/
    ├── purchase-request.utils.ts     # Utility สำหรับเตรียมข้อมูล PR
    └── stage.utils.ts                # Utility สำหรับเตรียมข้อมูล Stage
```

---

## Data Flow (การไหลของข้อมูล)

### 1. สร้าง PR ใหม่

```
User กดปุ่ม "New"
  → DialogNewPr.tsx แสดง Dialog ให้เลือก 2 ทาง:
    → "Blank PR" (สร้างเปล่า): Navigate ไป /procurement/purchase-request/new?type=blank
    → "Template PR" (ใช้ Template): เปิด DialogPrtList → เลือก Template → Navigate ไป /procurement/purchase-request/new?type=template&template_id=xxx
      → new/page.tsx โหลด Template แล้ว map ข้อมูลด้วย mapTemplateToPrInitValues()
  → MainForm.tsx render ในโหมด ADD
    → useForm() สร้าง form ด้วย CreatePrSchema validation
    → usePurchaseItemManagement() จัดการรายการสินค้า
    → useMainFormLogic() จัดการ Logic ทั้งหมด
  → User กรอกข้อมูล HeadForm (Workflow, Description, Note)
  → User เพิ่มรายการสินค้าผ่าน PurchaseItemDataGrid
  → User กด Save
    → form.handleSubmit() ตรวจสอบ Validation
    → handleSubmit() เรียก prepareSubmitData() เพื่อ clean ข้อมูล
    → createPurchaseRequest() เรียก useCreatePr mutation
    → POST /api/{buCode}/purchase-request
    → สำเร็จ: Redirect ไปหน้า Detail
    → ล้มเหลว: แสดง Toast Error
```

### 2. ดูรายละเอียด PR

```
User คลิกรายการ PR จากหน้า List
  → Navigate ไป /procurement/purchase-request/{bu_code}/{id}
  → [bu_code]/[id]/page.tsx:
    → usePurchaseRequestById() ดึงข้อมูล PR
    → fetchOnHandOrder() ดึงข้อมูล Inventory (on_hand_qty, on_order_qty) สำหรับทุก Item
    → render MainForm ในโหมด VIEW
  → MainForm แสดงข้อมูลทั้งหมดแบบ Read-only
    → ActionFields: แสดงปุ่ม Edit, Print, Export, Share
    → HeadForm: แสดง Workflow, วันที่, ผู้ขอ, แผนก
    → Tabs:
      → Tab "Items": PurchaseItemDataGrid แสดงรายการสินค้า
      → Tab "Workflow": WorkflowHistory แสดงประวัติ Workflow
    → WorkflowStep: แสดง Visual Workflow Progress
    → DetailsAndComments: แสดง Comment Section
```

### 3. แก้ไข PR

```
User กดปุ่ม Edit (ในโหมด VIEW)
  → currentMode เปลี่ยนเป็น EDIT
  → ฟอร์มทั้งหมดเปลี่ยนเป็น Editable
  → User แก้ไขข้อมูล:
    → เพิ่ม Item ใหม่ → เก็บใน "add" array
    → แก้ไข Item เดิม → เก็บใน "update" array
    → ลบ Item → เก็บใน "remove" array + track ใน removedItems Set
  → User กด Save
    → handleSubmit() เรียก updatePurchaseRequest()
    → save mutation: PATCH /api/{buCode}/purchase-request/{id}/save
    → สำเร็จ: Invalidate queries, กลับไปโหมด VIEW
    → ล้มเหลว: แสดง Toast Error
  → User กด Cancel
    → ถ้ามีการแก้ไข (isDirty): แสดง CancelConfirmDialog
    → ถ้าไม่มีการแก้ไข: กลับไปโหมด VIEW ทันที
```

### 4. Workflow Actions

```
Save (บันทึกร่าง)
  → PATCH /api/{buCode}/purchase-request/{id}/save
  → ไม่เปลี่ยนสถานะ

Submit (ส่งอนุมัติ)
  → prepareStageDetails() เตรียมข้อมูล Stage
  → Payload: { state_role: "create", details: [...] }
  → PATCH /api/{buCode}/purchase-request/{id}/submit
  → สถานะ PR เปลี่ยนจาก DRAFT → SUBMIT

Approve (อนุมัติ)
  → preparePurchaseApproveData() เตรียมข้อมูลอนุมัติ
  → ส่งข้อมูล approved_qty, vendor, price, tax, discount ของแต่ละ Item
  → PATCH /api/{buCode}/purchase-request/{id}/approve
  → ส่ง Notification ให้ผู้เกี่ยวข้อง

Purchase Approve (อนุมัติจัดซื้อ)
  → preparePurchaseApproveData() เตรียมข้อมูลเหมือน Approve
  → PATCH /api/{buCode}/purchase-request/{id}/purchase
  → Stage role: "purchase"

Reject (ปฏิเสธ)
  → prepareStageDetails() เตรียมข้อมูล Stage
  → Payload: { state_role: "create", details: [...] }
  → PATCH /api/{buCode}/purchase-request/{id}/reject
  → ส่ง Notification ให้ผู้เกี่ยวข้อง

Send Back (ส่งกลับแก้ไข)
  → prepareStageDetails() เตรียมข้อมูล Stage
  → Payload: { state_role: "create", details: [...] }
  → PATCH /api/{buCode}/purchase-request/{id}/send_back
  → ส่ง Notification ให้ผู้เกี่ยวข้อง

Review (ส่งทบทวน)
  → เปิด ReviewStageDialog ให้เลือก Stage ที่ต้องการส่งกลับ
  → usePrevWorkflow() ดึง Previous Stages จาก API
  → Payload: { state_role: "create", des_stage: "selected_stage", details: [...] }
  → PATCH /api/{buCode}/purchase-request/{id}/review

Split (แยกรายการ)
  → เลือก Items ที่ต้องการแยก
  → POST /api/{buCode}/purchase-request/{id}/split
  → Payload: { detail_ids: [...] }
```

---

## สถานะ (Status)

### สถานะเอกสาร (PR Status)

| สถานะ | ค่า | คำอธิบาย |
|-------|-----|---------|
| Draft | `draft` | ร่าง - เพิ่งสร้าง ยังไม่ส่งอนุมัติ |
| Submit | `submit` | ส่งอนุมัติแล้ว |
| In Progress | `in_progress` | อยู่ระหว่างดำเนินการ |
| Approved | `approved` | อนุมัติแล้ว |
| Rejected | `rejected` | ถูกปฏิเสธ |
| Completed | `completed` | เสร็จสมบูรณ์ |
| Voided | `voided` | ยกเลิกแล้ว |

### สถานะรายการ (Item Status)

| สถานะ | ค่า | คำอธิบาย |
|-------|-----|---------|
| Pending | `pending` | รอดำเนินการ |
| Approved | `approved` / `approve` | อนุมัติแล้ว |
| Review | `review` | ส่งทบทวน |
| Rejected | `rejected` / `reject` | ถูกปฏิเสธ |
| Send Back | `send_back` | ส่งกลับแก้ไข |
| Submit | `submit` | ส่งอนุมัติแล้ว |

---

## Roles (บทบาท)

ระบบกำหนดบทบาทผู้ใช้ผ่าน `STAGE_ROLE` enum:

| Role | ค่า | สิทธิ์ |
|------|-----|-------|
| Create | `create` | สร้าง/แก้ไข PR, ส่งอนุมัติ |
| Approve | `approve` | อนุมัติ/ปฏิเสธ/ส่งทบทวน/ส่งกลับ Items |
| Purchase | `purchase` | อนุมัติจัดซื้อ - กำหนด Vendor, ราคา, ภาษี, ส่วนลด |
| Issue | `issue` | ออกเอกสาร/ดำเนินการ |
| View Only | `view_only` | ดูอย่างเดียว - ไม่มีปุ่ม Edit |

---

## DTOs (Data Transfer Objects)

### โครงสร้างข้อมูลหลัก

#### BasePurchaseRequest
ข้อมูลพื้นฐานของ PR:
- `id` - รหัส PR (UUID)
- `pr_no` - เลขที่ PR
- `pr_date` - วันที่ PR
- `description` - คำอธิบาย
- `pr_status` - สถานะ PR

#### PurchaseRequestListDto
ใช้แสดงในหน้า List (สืบทอดจาก BasePurchaseRequest):
- `requestor_name` - ชื่อผู้ขอ
- `department_name` - ชื่อแผนก
- `workflow_name` - ชื่อ Workflow
- `workflow_current_stage` - Stage ปัจจุบัน
- `purchase_request_detail[]` - รายการย่อ (price, total_price)
- `total_amount` - ยอดรวม

#### PurchaseRequestByIdDto
ใช้แสดงรายละเอียด PR เต็ม (สืบทอดจาก BasePurchaseRequest + WorkflowInfo + WorkflowActionInfo + RequestorInfo + AuditInfo):
- `note` - หมายเหตุ
- `role` - บทบาทผู้ใช้ปัจจุบัน (STAGE_ROLE)
- `purchase_request_detail[]` - รายละเอียดสินค้าเต็ม

#### PurchaseRequestDetail
ข้อมูลรายการสินค้าแต่ละรายการ (สืบทอดจากหลาย Interface):

**ข้อมูลสินค้า (ProductInfo):**
- `product_id`, `product_name`, `product_local_name`

**ข้อมูลสถานที่ (LocationInfo):**
- `location_id`, `location_name`
- `delivery_point_id`, `delivery_point_name`
- `delivery_date`

**ข้อมูลหน่วย (UnitInfo):**
- `inventory_unit_id`, `inventory_unit_name`

**ข้อมูล Vendor (VendorInfo):**
- `vendor_id`, `vendor_name`

**ข้อมูล Pricelist (PriceListInfo):**
- `pricelist_detail_id`, `pricelist_no`, `pricelist_unit`, `pricelist_price`

**ข้อมูลสกุลเงิน (CurrencyInfo):**
- `currency_id`, `currency_name`, `exchange_rate`, `exchange_rate_date`

**จำนวนที่ขอ (QuantityInfo):**
- `requested_qty` - จำนวนที่ขอ
- `requested_unit_id`, `requested_unit_name`
- `requested_unit_conversion_factor` - อัตราแปลงหน่วย
- `requested_base_qty` - จำนวนหน่วยฐาน

**จำนวนที่อนุมัติ (ApprovedQuantityInfo):**
- `approved_qty` - จำนวนที่อนุมัติ
- `approved_unit_id`, `approved_unit_name`
- `approved_unit_conversion_factor`
- `approved_base_qty`

**จำนวน FOC (FocQuantityInfo):**
- `foc_qty` - จำนวนของแถม
- `foc_unit_id`, `foc_unit_name`
- `foc_unit_conversion_factor`
- `foc_base_qty`

**ข้อมูลภาษี (TaxInfo):**
- `tax_profile_id`, `tax_profile_name`
- `tax_rate`, `tax_amount`, `base_tax_amount`
- `is_tax_adjustment`

**ข้อมูลส่วนลด (DiscountInfo):**
- `discount_rate`, `discount_amount`, `base_discount_amount`
- `is_discount_adjustment`

**การคำนวณราคา (PriceCalculation):**
- `sub_total_price`, `net_amount`, `total_price`
- `base_price`, `base_sub_total_price`, `base_net_amount`, `base_total_price`

**ข้อมูลสินค้าคงคลัง (OnHandOnOrder):**
- `on_hand_qty` - จำนวนคงเหลือ
- `on_order_qty` - จำนวนที่สั่งซื้ออยู่
- `re_order_qty` - จุดสั่งซื้อใหม่
- `re_stock_qty` - จำนวนเติมสต็อก

**ข้อมูลทั่วไป (DetailCommonInfo):**
- `sequence_no`, `description`, `comment`
- `stage_status`, `stage_message`, `current_stage_status`
- `history`, `info`, `dimension`

**ข้อมูล Audit (AuditInfo):**
- `doc_version`, `created_at`, `created_by_id`
- `updated_at`, `updated_by_id`
- `deleted_at`, `deleted_by_id`

### DTOs สำหรับ Form

#### CreatePrDto (สำหรับส่งสร้าง PR)
```typescript
{
  state_role: STAGE_ROLE,        // บทบาทผู้สร้าง
  details: {
    pr_date: string,             // วันที่ PR
    requestor_id: string,        // ID ผู้ขอ
    department_id: string,       // ID แผนก
    workflow_id: string,         // ID Workflow
    description?: string,        // คำอธิบาย
    note?: string,               // หมายเหตุ
    purchase_request_detail?: {
      add?: CreatePurchaseRequestDetailDto[],   // รายการใหม่
      update?: UpdatePurchaseRequestDetailDto[], // รายการแก้ไข
      remove?: { id: string }[],                // รายการลบ
    }
  }
}
```

#### SplitPrPayload (สำหรับแยกรายการ)
```typescript
{
  detail_ids: string[]  // ID ของรายการที่ต้องการแยก
}
```

---

## Validation (การตรวจสอบข้อมูล)

### Zod Schema

ไฟล์: `_schemas/purchase-request-form.schema.ts`

#### CreatePrSchema (Schema หลักสำหรับสร้าง/แก้ไข PR)

**ฟิลด์บังคับ:**
- `state_role` - บทบาท (STAGE_ROLE enum)
- `details.pr_date` - วันที่ PR
- `details.requestor_id` - UUID ผู้ขอ
- `details.department_id` - UUID แผนก
- `details.workflow_id` - UUID Workflow

**Custom Validation (superRefine):**
สำหรับทุก Item ใน `add` array:
- `location_id` - ต้องระบุ Location
- `product_id` - ต้องระบุ Product
- `requested_qty` - ต้องระบุ และต้องเป็นตัวเลข >= 0
- `requested_unit_id` - ต้องระบุหน่วย

#### CreatePurchaseRequestDetailSchema
- `delivery_point_id` - UUID (บังคับ)
- `delivery_date` - ISO datetime (บังคับ)
- ฟิลด์อื่นๆ เป็น optional ทั้งหมด

#### UpdatePurchaseRequestDetailSchema
- `id` - UUID (บังคับ) - ระบุ Item ที่จะแก้ไข
- `delivery_point_id` - UUID (บังคับ)
- `delivery_date` - ISO datetime (บังคับ)
- เพิ่ม `stage_status` (ItemStatus enum) และ `stage_message` สำหรับ Workflow Actions

---

## Hooks (Custom Hooks)

### useMainFormLogic
**ไฟล์:** `_hooks/use-main-form-logic.ts`

Hook หลักที่ประสานงานทุกส่วนของฟอร์ม

**Input:**
- `mode` - โหมดฟอร์ม (ADD / EDIT / VIEW)
- `initValues` - ข้อมูล PR เดิม (ถ้ามี)
- `form` - React Hook Form instance
- `purchaseItemManager` - Hook จัดการรายการสินค้า
- `bu_code` - รหัสหน่วยธุรกิจ

**State ที่จัดการ:**
- `currentMode` - โหมดปัจจุบัน (ADD / EDIT / VIEW)
- `deleteDialogOpen` - สถานะ Dialog ลบ
- `cancelDialogOpen` - สถานะ Dialog ยกเลิก
- `reviewDialogOpen` - สถานะ Dialog ส่งทบทวน
- `selectedStage` - Stage ที่เลือกสำหรับ Review
- `itemToDelete` - Item ที่กำลังจะลบ

**Computed Values:**
- `itemsStatusSummary` - สรุปจำนวน Item ตามสถานะ (approved, review, rejected, pending, newItems)
- `isDisabled` - ปุ่ม Save ควร disable หรือไม่ (กำลังโหลด / มี error / ไม่มี workflow_id)
- `isApproveDisabled` - ปุ่ม Approve ควร disable หรือไม่ (ไม่มี Items / Items ไม่มี vendor หรือ price)
- `workflowStages` - ขั้นตอน Workflow จาก workflow_history
- `requestorName` - ชื่อผู้ขอ (firstname + lastname)

**Handlers ที่ให้:**
- `handleSubmit(data)` - สร้างหรืออัปเดต PR ตาม mode
- `handleConfirmDelete()` - ลบ Item ที่เลือก
- `handleCancel(event, type)` - จัดการยกเลิก (ตรวจสอบ isDirty ก่อน)
- `handleConfirmCancel()` - ยืนยันยกเลิก
- `onSubmitPr()` - ส่ง PR เข้า Workflow
- `onApprove()` - อนุมัติ Items + ส่ง Notification
- `onReject()` - ปฏิเสธ Items + ส่ง Notification
- `onSendBack()` - ส่งกลับแก้ไข + ส่ง Notification
- `onPurchaseApprove()` - อนุมัติจัดซื้อ
- `onReview()` - เปิด ReviewStageDialog
- `handleReviewConfirm()` - ยืนยัน Review พร้อม Stage ที่เลือก

---

### usePurchaseItemManagement
**ไฟล์:** `_hooks/use-purchase-item-management.ts`

Hook จัดการ CRUD ของรายการสินค้าในฟอร์ม

**Input:**
- `form` - React Hook Form instance
- `initValues` - รายการสินค้าเดิม
- `defaultCurrencyId` - สกุลเงินเริ่มต้น

**State:**
- `items` - รายการสินค้าทั้งหมด (ใหม่ + เดิม - ที่ลบแล้ว)
- `currentItems` - รายการสินค้าพร้อมค่าที่อัปเดตแล้ว
- `updatedItems` - Record<string, Partial> ของ Items ที่ถูกแก้ไข
- `removedItems` - Set<string> ของ ID Items ที่ถูกลบ

**Actions:**

`addItem()`:
- สร้าง Item ใหม่ด้วย nanoid()
- ตั้งค่าเริ่มต้น: delivery_date = พรุ่งนี้, currency = default, qty = 0
- Prepend เข้า field array (แสดงด้านบนตาราง)
- Trigger validation หลังเพิ่ม

`updateItem(itemId, fieldName, value, selectedProduct?)`:
- ตรวจสอบว่าเป็น Item ใหม่หรือเดิม
- ถ้า Item ใหม่: อัปเดตใน "add" array ของ form
- ถ้า Item เดิม: อัปเดตใน "update" array ของ form + อัปเดต state สำหรับ UI
- ถ้าเลือก product: auto-fill product_name, inventory_unit_id, inventory_unit_name
- ถ้าเป็นฟิลด์ quantity: แปลงเป็น Number อัตโนมัติ

`removeItem(itemId, isNewItem?, itemIndex?)`:
- ถ้า Item ใหม่: ลบจาก field array
- ถ้า Item เดิม:
  - ลบจาก "update" array (ถ้ามี)
  - เพิ่มเข้า "remove" array
  - อัปเดต removedItems Set สำหรับ UI

`getItemValue(item, fieldName)`:
- ดึงค่าปัจจุบันของ Item (ค่าที่แก้ไข หรือค่าเดิม)
- ตรวจสอบจาก: form add array → form update array → updatedItems state → ค่าเดิม

---

### usePrActions
**ไฟล์:** `_hooks/use-pr-actions.ts`

Hook รวม Mutation ทั้งหมดของ Workflow Actions

**สร้าง 7 Mutations ด้วย useUpdateUPr:**
1. `save` → PATCH `/api/{buCode}/purchase-request/{id}/save`
2. `submit` → PATCH `/api/{buCode}/purchase-request/{id}/submit`
3. `approve` → PATCH `/api/{buCode}/purchase-request/{id}/approve`
4. `purchase` → PATCH `/api/{buCode}/purchase-request/{id}/purchase`
5. `review` → PATCH `/api/{buCode}/purchase-request/{id}/review`
6. `reject` → PATCH `/api/{buCode}/purchase-request/{id}/reject`
7. `sendBack` → PATCH `/api/{buCode}/purchase-request/{id}/send_back`

**Loading States:**
- `isPending` - รวม loading state ทั้งหมด
- `loadingStates` - แยกตาม action (isSaving, isSubmitting, isApproving, etc.)

**Error States:**
- `isError` - รวม error state ทั้งหมด
- `errors` - แยกตาม action (saveError, submitError, etc.)

---

### usePurchaseItemTable
**ไฟล์:** `_hooks/use-purchase-item-table.ts`

Hook จัดการ UI interactions ของตารางสินค้า

**Bulk Action Enum:**
- `APPROVED` = "approved"
- `REVIEW` = "review"
- `REJECTED` = "rejected"
- `SPLIT` = "split"

**State ที่จัดการ:**
- Delete dialog (deleteDialogOpen, itemToDelete)
- Select all dialog (selectAllDialogOpen, selectMode: "all" | "pending")
- Bulk action dialog (bulkActionDialogOpen, bulkActionType, bulkActionMessage)
- Table sorting state

**Handlers:**
- `handleRemoveItemClick(id, isNewItem?, itemIndex?)` - เปิด Delete dialog
- `handleConfirmDelete()` - ยืนยันลบ item แล้วปิด dialog
- `handleBulkActionClick(action)` - จัดการ Bulk action:
  - APPROVED / SPLIT → ดำเนินการทันที (ไม่เปิด dialog)
  - REVIEW / REJECTED → เปิด BulkActionDialog ให้ใส่ message

---

### usePrevWorkflow
**ไฟล์:** `_hooks/use-prev-workflow.ts`

ดึง Previous Stages ของ Workflow สำหรับใช้ใน Review Dialog

- Endpoint: `GET /api/{buCode}/workflow/{workflow_id}/previous_stages`
- รองรับ filter ด้วย stage parameter
- เปิดใช้เมื่อ reviewDialogOpen = true

---

### useWorkflowStage
**ไฟล์:** `_hooks/use-workflow-stage.ts`

ดึง Workflow Stages สำหรับแสดง Visual Progress

- Endpoint: `GET /api/{buCode}/purchase-request/workflow-stages`

---

### useInventoryData
**ไฟล์:** `_hooks/use-inventory-data.ts`

ดึงข้อมูลสินค้าคงคลัง

- Return: on_hand_qty, on_order_qty, re_order_qty, re_stock_qty
- คำนวณ stockLevel เป็นเปอร์เซ็นต์

---

## API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| GET | `/api/purchase-request` | ดึงรายการ PR ทั้งหมด (รองรับ pagination, filter, sort) |
| GET | `/api/my-pending/purchase-request` | ดึงรายการ PR ที่รอดำเนินการของผู้ใช้ |
| GET | `/api/{buCode}/purchase-request/{id}` | ดึงรายละเอียด PR ตาม ID |
| POST | `/api/{buCode}/purchase-request` | สร้าง PR ใหม่ |
| PUT | `/api/{buCode}/purchase-request/{id}` | อัปเดต PR (Full Update) |
| PATCH | `/api/{buCode}/purchase-request/{id}/save` | บันทึกร่าง |
| PATCH | `/api/{buCode}/purchase-request/{id}/submit` | ส่งอนุมัติ |
| PATCH | `/api/{buCode}/purchase-request/{id}/approve` | อนุมัติ |
| PATCH | `/api/{buCode}/purchase-request/{id}/purchase` | อนุมัติจัดซื้อ |
| PATCH | `/api/{buCode}/purchase-request/{id}/reject` | ปฏิเสธ |
| PATCH | `/api/{buCode}/purchase-request/{id}/review` | ส่งทบทวน |
| PATCH | `/api/{buCode}/purchase-request/{id}/send_back` | ส่งกลับแก้ไข |
| DELETE | `/api/{buCode}/purchase-request/{id}` | ลบ PR |
| POST | `/api/{buCode}/purchase-request/{id}/split` | แยกรายการ PR |
| GET | `/api/{buCode}/purchase-request/workflow-stages` | ดึง Workflow Stages |
| GET | `/api/{buCode}/workflow/{workflowId}/previous_stages` | ดึง Previous Stages |

---

## Handlers (ตัวจัดการ)

### purchase-request-create.handlers.ts

- `handleCreateSuccess()` - สร้างสำเร็จ → Redirect ไป `/procurement/purchase-request/{buCode}/{id}` + แสดง Toast
- `handleCreateError()` - สร้างล้มเหลว → Log error + แสดง Toast Error
- `createPurchaseRequest()` - Wrapper เรียก mutation พร้อม callbacks

### purchase-request-update.handlers.ts

- `handleUpdateSuccess()` - อัปเดตสำเร็จ → แสดง Toast + Invalidate queries + กลับ VIEW mode
- `handleUpdateError()` - อัปเดตล้มเหลว → Log error + แสดง Toast Error
- `updatePurchaseRequest()` - Wrapper เรียก save mutation พร้อม callbacks

### purchase-request-actions.handlers.ts

- `handleActionSuccess()` - Action สำเร็จ → แสดง Toast + Invalidate queries
- `handleActionError()` - Action ล้มเหลว → แสดง Toast Error
- `submitPurchaseRequest()` - ส่งอนุมัติด้วย state_role = CREATE
- `rejectPurchaseRequest()` - ปฏิเสธด้วย state_role = APPROVE
- `sendBackPurchaseRequest()` - ส่งกลับด้วย state_role = ISSUE

---

## Utilities (ฟังก์ชันช่วย)

### purchase-request.utils.ts

- `cleanPurchaseRequestDetail(item)` - ลบ `id` และ empty fields จาก Item (สำหรับ Item ใหม่ที่ยังไม่มี ID จาก server)
- `hasPurchaseRequestDetails(data)` - ตรวจสอบว่า PR มีรายการสินค้าใน add array หรือไม่
- `processPurchaseRequestDetails(details)` - Clean ทุก Item ใน array
- `prepareSubmitData(data)` - เตรียมข้อมูลสำหรับส่ง API โดย clean รายการสินค้าใน add array
- `preparePurchaseApproveData(items, prId, stateRole, defaultMessage)`:
  - แปลง Items เป็น format สำหรับ Approve/Purchase
  - Map ข้อมูล: id, state_status="approve", state_message
  - แปลงค่าตัวเลขทั้งหมดด้วย Number() (approved_qty, tax, discount, price, etc.)
  - รวมข้อมูล vendor, currency, foc

### stage.utils.ts

- `createStageDetail(itemId, stageStatus, stageMessage, defaultMessage)` - สร้างข้อมูล Stage Detail สำหรับ Item
- `prepareStageDetails(items, getItemValue, action, defaultMessage)` - Map Items ทั้งหมดเป็น Stage Details สำหรับ Workflow Actions

---

## Components (ส่วนประกอบ UI)

### หน้า List

#### PurchaseRequestComponent
Component หลักของหน้ารายการ PR:
- Toggle ระหว่าง "My Pending" กับ "All Documents" (FETCH_TYPE enum)
- Toggle ระหว่าง List View กับ Grid View
- ค้นหา, กรอง, เรียงลำดับ, แบ่งหน้า
- Export (Excel, PDF, Word)
- ปุ่ม "New" เปิด DialogNewPr ให้เลือก: สร้างเปล่า (Blank PR) หรือใช้ Template (Template PR)

#### PurchaseRequestList
แสดง PR เป็นตาราง (TanStack React Table):
- Columns: PR No, Date, Type, Status, Stage, Requestor, Department, Amount
- Actions: Edit, Delete, Export
- Row click → Navigate ไปหน้า Detail
- รองรับ Sorting

#### PurchaseRequestGrid
แสดง PR เป็น Cards:
- ข้อมูลเหมือน List แต่แสดงแบบ Card layout
- รองรับ Selection checkboxes
- Delete confirmation

#### FilterPurchaseRequest
Panel กรองข้อมูล:
- Status, Stage, PR Type, Department, Date Range
- ปุ่ม Apply / Reset

### ฟอร์ม PR

#### MainForm
Component ฟอร์มหลัก:
- ใช้ `react-hook-form` + `zodResolver` สำหรับ validation
- Wrap ด้วย `PurchaseRequestProvider` (Context)
- Wrap ด้วย `DetailsAndComments` (layout)
- ประกอบด้วย:
  - `ActionFields` - ปุ่มด้านบน
  - `HeadForm` - ข้อมูลหัวเอกสาร
  - `Tabs` (Items / Workflow)
  - `WorkflowStep` - Visual workflow
  - `ActionButtons` - ปุ่ม Workflow Actions ด้านล่าง
  - `CommentComponent` - ระบบ Comment
  - Dialogs (Delete, Cancel, Review)

#### HeadForm
ส่วนหัวฟอร์ม (Grid 4 columns):
- **PR Type** - Lookup Workflow (disabled ใน VIEW mode)
- **PR Date** - DateInput (disabled เสมอ - ใช้วันปัจจุบัน)
- **Requestor** - Input (disabled - แสดงชื่อผู้ใช้ปัจจุบัน)
- **Department** - Input (disabled - แสดงแผนกผู้ใช้)
- **Description** - Textarea (disabled ใน VIEW mode)
- **Note** - Textarea (disabled ใน VIEW mode)

#### ActionFields
ปุ่มด้านบนฟอร์ม:
- **Back** (ChevronLeft) - กลับไปหน้า List (ตรวจสอบ unsaved changes)
- **PR Number** + **Status Badge** - แสดงเลขที่และสถานะ
- ใน VIEW mode: ปุ่ม Edit
- ใน ADD/EDIT mode: ปุ่ม Cancel + Save
- Print, Export, Share (ทุก mode)
- ซ่อนปุ่มทั้งหมด (ยกเว้น Back) ถ้า role = VIEW_ONLY หรือ status = voided

#### ActionButtons
ปุ่ม Workflow Actions ด้านล่างฟอร์ม (sticky bottom):

**โหมด New PR (isNewPr = true):**
- แสดงปุ่ม **Save** เท่านั้น

**โหมด Existing PR (isNewPr = false):**
ปุ่มแสดงตาม itemsStatusSummary:

- **ถ้ามี pending items และไม่ใช่ draft** → ไม่แสดงปุ่มใดเลย (return null)
- **ถ้ามี review items** → แสดงปุ่ม **Review** เท่านั้น
- **ถ้ามีเฉพาะ approved items** → แสดงปุ่ม **Approve** เท่านั้น
- **ถ้ามีเฉพาะ rejected items** → แสดงปุ่ม **Reject** เท่านั้น
- **กรณีอื่นๆ (มีสถานะผสม)** → แสดงทุกปุ่ม: **Reject**, **Send Back**, **Review**, **Approve**, **Purchase Approve**
- **Submit** → แสดงเมื่อ prStatus ไม่ใช่ "in_progress" (ทุกกรณีที่ไม่ใช่ draft+no pending)

**การ disable ปุ่ม:**
- ทุกปุ่มจะ disable เมื่อ `isPending` = true (กำลังดำเนินการ)
- Submit disable เพิ่มเมื่อ `isSubmitDisabled` = true (ไม่มี workflow_id)
- Purchase Approve disable เพิ่มเมื่อ `isApproveDisabled` = true (Items ไม่มี vendor/price)

#### PurchaseItemDataGrid
ตารางรายการสินค้า (TanStack React Table):
- Expandable rows (แสดง ExpandedContent)
- ปุ่ม "Add Item" (ต้องเลือก Workflow ก่อนจึงจะเพิ่มได้)
- ปุ่ม "Auto Allocate" (เฉพาะ role = purchase):
  - ดึง Price Compare จาก API สำหรับทุก Item
  - เลือก Vendor ที่เป็น preferred หรือ vendor แรกในรายการ
  - Auto-fill: vendor, pricelist, price, sub_total, base_price
- Bulk Actions (แสดงเมื่อเลือก rows):
  - **Approve** - อัปเดต stage_status เป็น "approved" ทันที (ไม่ต้องใส่ message)
  - **Review** - เปิด BulkActionDialog ให้ใส่ message ก่อน
  - **Reject** - เปิด BulkActionDialog ให้ใส่ message ก่อน
  - **Split** - แยก Items ที่เลือกไปเป็น PR ใหม่ (POST split API) แล้วแสดง Link ไป PR ใหม่
- Delete confirmation dialog
- Select all dialog (เลือก "all" หรือ "pending" items)
- Sorting: Items ใหม่แสดงด้านบน, Items เดิมเรียงตาม sequence_no
- Columns กำหนดใน PurchaseItemColumns
- ใช้ usePurchaseItemTable hook จัดการ UI state (dialogs, bulk actions, sorting)

#### PurchaseItemColumns
กำหนด Column ของตารางสินค้า:
- **Location** - LookupLocation
- **Product** - LookupProductLocation (auto-fill unit เมื่อเลือก)
- **Unit** - UnitSelectCell
- **Delivery Point** - LookupDeliveryPointSelect
- **Delivery Date** - DateInput
- **Requested Qty** - NumberInput
- **Approved Qty** - NumberInput
- **FOC Qty** - NumberInput
- **Vendor** - LookupVendor (แสดงเมื่อ EDIT mode + role เหมาะสม)
- **Price** - NumberInput พร้อม Currency lookup
- **Tax** - Tax profile lookup + rate/amount
- **Discount** - Rate/Amount inputs
- **Status Badge** - Pending/Approved/Review/Rejected
- **Actions** - ปุ่มลบ

#### WorkflowStep
แสดง Workflow Progress แบบ Visual:
- ดึงข้อมูลจาก `workflowStages` (แปลงมาจาก workflow_history)
- แสดงเป็น Horizontal Steps พร้อม ChevronRight คั่น
- Stage สุดท้าย (ปัจจุบัน) แสดงเครื่องหมายถูก (Check icon) + font semibold
- Stage ก่อนหน้าแสดงหมายเลขลำดับ + text-muted
- ซ่อนถ้าไม่มี workflowStages

#### WorkflowHistory
แสดงประวัติ Workflow ในรูปแบบ Timeline

---

## Context & State Management

### PurchaseRequestContext
**ไฟล์:** `_components/form-pr/PurchaseRequestContext.tsx`

React Context ที่ส่ง Return Value ของ `useMainFormLogic` ไปให้ Child Components

```typescript
type PurchaseRequestContextType = ReturnType<typeof useMainFormLogic>;
```

ใช้ `usePurchaseRequestContext()` ใน Child Components เพื่อเข้าถึง:
- State (currentMode, dialogs, etc.)
- Computed Values (isDisabled, prStatus, etc.)
- Handlers (handleSubmit, onApprove, etc.)

---

## Form Modes (โหมดฟอร์ม)

### ADD (สร้างใหม่)
- ฟิลด์ทั้งหมด Editable (ยกเว้น Date, Requestor, Department)
- ยังไม่มี PR Number
- Items อยู่ใน "add" array เท่านั้น
- ปุ่ม: Save, Cancel
- Save → POST สร้าง PR → Redirect ไปหน้า Detail

### VIEW (ดูรายละเอียด)
- ฟิลด์ทั้งหมด Readonly/Disabled
- แสดง PR Number + Status Badge
- ปุ่ม: Edit, Print, Export, Share + Workflow Actions
- Workflow Actions แสดงตาม role และ status

### EDIT (แก้ไข)
- ฟิลด์ Editable (ยกเว้น Date, Requestor, Department)
- Items แยกเป็น add/update/remove arrays
- ปุ่ม: Save, Cancel
- Cancel → ตรวจสอบ isDirty → แสดง Dialog ถ้ามีการแก้ไข
- Save → PATCH อัปเดต PR → กลับ VIEW mode

---

## Notifications (การแจ้งเตือน)

ระบบส่ง Notification ผ่าน `useSendNotification` hook หลัง Workflow Actions:

| Action | Notification Title | Type |
|--------|-------------------|------|
| Approve | "Purchase Request Approved" | success |
| Reject | "Purchase Request Rejected" | error |
| Send Back | "Purchase Request Sent Back" | warning |

Notification ประกอบด้วย:
- `title` - หัวข้อ
- `message` - ข้อความพร้อม Link ไป PR Detail
- `type` - ประเภท (success/error/warning)
- `category` - "user-to-user"
- `to_user_id`, `from_user_id` - ผู้ส่ง/ผู้รับ
- `link` - URL ไปหน้า PR Detail

---

## Comment & Attachment System

MainForm รวมระบบ Comment/Attachment ผ่าน Hooks:
- `usePrCommentAttachmentsQuery` - ดึง Comments
- `usePrCommentAttachmentsMutate` - สร้าง Comment ใหม่
- `useUpdatePrCommentAttachment` - แก้ไข Comment
- `useUpdatePrCommentAttachmentFiles` - อัปเดตไฟล์แนบ
- `useDeletePrCommentAttachment` - ลบ Comment

ฟังก์ชัน:
- `handleAddComment(message, attachments)` - เพิ่ม Comment พร้อมไฟล์แนบ
- `handleEditComment(commentId, message, attachments?)` - แก้ไข Comment
- `handleDeleteComment(commentId)` - ลบ Comment
- `handleFileUpload(file)` - สร้าง temporary AttachmentDto จากไฟล์

---

## Template System

การสร้าง PR จาก Template:

1. User เลือก Template จาก DialogPrtList
2. Navigate ไป `/procurement/purchase-request/new?type=template&template_id={id}`
3. `new/page.tsx` โหลด Template ด้วย `usePrTemplateByIdQuery`
4. `mapTemplateToPrInitValues()` แปลงข้อมูล Template เป็น PR format:
   - Map product, location, unit, currency, quantity, tax, discount
   - ตั้ง approved_qty = requested_qty
   - ตั้ง vendor, pricelist เป็น undefined
   - ตั้ง delivery_date = วันปัจจุบัน
   - สร้าง ID ใหม่ด้วย nanoid()
5. Items จาก Template ถูก sanitize (null → undefined) แล้วเข้า "add" array

---

## Error Handling

### Error Messages (`_constants/error-messages.ts`)

ข้อความ Error/Success ทั้งหมดเป็น i18n keys (ใช้กับ next-intl):

**Validation:**
- required_fields, location_required, product_required, quantity_required, quantity_invalid, unit_required

**API:**
- create_failed, update_failed, submit_failed, approve_failed, reject_failed, review_failed, send_back_failed, purchase_failed, fetch_failed

**Success:**
- created, updated, submitted, approved, rejected, reviewed, sent_back, purchased

**Workflow:**
- stage_required, stage_fetch_failed

**Item:**
- delete_failed, add_failed, update_failed

**General:**
- unauthorized, network_error, unknown_error

### การแสดง Error
- ใช้ `toastError()` และ `toastSuccess()` (Sonner/Toast) สำหรับแสดงข้อความ
- ใช้ `console.error()` สำหรับ log ข้อมูล debug
- Zod validation errors แสดงผ่าน react-hook-form `FormMessage`

---

## External Dependencies

| Library | การใช้งาน |
|---------|----------|
| `react-hook-form` | จัดการ Form State, Validation, Field Arrays |
| `@hookform/resolvers/zod` | เชื่อมต่อ Zod schema กับ react-hook-form |
| `zod` | Schema validation |
| `@tanstack/react-query` | Server State Management (Query, Mutation, Cache) |
| `@tanstack/react-table` | ตารางข้อมูล (Sorting, Pagination, Expandable Rows) |
| `next-intl` | Internationalization (i18n) |
| `nanoid` | สร้าง Unique ID สำหรับ Item ใหม่ |
| `date-fns` | จัดรูปแบบวันที่ |
| `axios` | HTTP Client (ใช้ใน useDeletePr) |
| `lucide-react` | Icons |
| `sonner` / Toast | แสดงข้อความ Notification |

---

## Context Dependencies

| Context | ข้อมูลที่ใช้ |
|---------|-------------|
| `AuthContext` | token, buCode, user, departments |
| `BuConfigContext` | dateFormat, currencyBase, defaultCurrencyId |
