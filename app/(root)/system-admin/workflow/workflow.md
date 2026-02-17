# Workflow Management Module

## Overview

โมดูล Workflow Management เป็นระบบจัดการ workflow สำหรับกระบวนการอนุมัติเอกสาร เช่น Purchase Request, Store Requisition, Purchase Order โดยผู้ใช้สามารถสร้าง แก้ไข และจัดการ workflow ได้อย่างยืดหยุ่น รวมถึงกำหนด stages, routing rules, products และ notification templates

---

## Folder Structure

```
app/[locale]/(root)/system-administration/workflow-management/
├── page.tsx                          # หน้า List - แสดงรายการ workflows ทั้งหมด
├── new/
│   └── page.tsx                      # หน้า Create - สร้าง workflow ใหม่
├── [id]/
│   └── page.tsx                      # หน้า Edit/View - แก้ไข/ดู workflow
├── _components/
│   ├── WorkflowComponent.tsx         # Container หลักของหน้า List (tabs, search, filter)
│   ├── WorkflowList.tsx              # Data Grid แสดงรายการ workflows
│   ├── WorkflowDetail.tsx            # Container หลักของหน้า Edit (tabs, form)
│   ├── WorkflowHeader.tsx            # Header พร้อมปุ่ม actions (edit/save/delete)
│   ├── WorkflowGeneral.tsx           # Tab General - ข้อมูลทั่วไป
│   ├── WorkflowStages.tsx            # Tab Stages - จัดการ stages (drag-drop)
│   ├── StageList.tsx                 # Sidebar รายการ stages (sortable)
│   ├── StageDetailPanel.tsx          # Panel แก้ไข stage (general/notifications/users)
│   ├── WorkflowRouting.tsx           # Tab Routing - กำหนด routing rules
│   ├── WorkflowProducts.tsx          # Tab Products - กำหนดสินค้า (tree view)
│   ├── WorkflowNotifications.tsx     # การตั้งค่า notifications
│   ├── WorkflowStageNotification.tsx # Notification เฉพาะ stage
│   └── WorkflowTemplates.tsx         # จัดการ notification templates
├── _hook/
│   └── use-workflow-detail.ts        # Hook สำหรับ fetch ข้อมูล workflow by ID
└── data/
    └── mockData.ts                   # Mock data สำหรับ notification templates

# ไฟล์ภายนอก module ที่เกี่ยวข้อง
hooks/use-workflow.ts                 # React Query hooks (CRUD operations)
services/workflow.ts                  # Service layer สำหรับ API calls
dtos/workflows.dto.ts                # Type definitions และ Zod schemas
```

---

## UI ทำงานอย่างไร

### 1. หน้ารายการ Workflows (List Page)

**File**: `page.tsx` → `WorkflowComponent.tsx` → `WorkflowList.tsx`

- แสดง Tab 2 แท็บ: **Workflows** | **Templates**
- มี Search bar ค้นหาชื่อ workflow
- มี Filter ตาม status (Active/Inactive)
- มี Sort ตามคอลัมน์
- มี Pagination (5/10/25/50/100 per page)
- ตาราง Data Grid แสดงคอลัมน์: #, Name, Type, Stages (จำนวน), Status, Action
- คลิกชื่อ workflow (ButtonLink) → นำทางไปหน้า Edit (`/workflow-management/[id]`)
- Dropdown menu ต่อแถว: Print, Export, Delete (หมายเหตุ: ทั้ง 3 actions ยังเป็น `console.log` เท่านั้น ยังไม่ได้ implement จริง)
- ปุ่ม "New Workflow" → นำทางไปหน้า Create

### 2. หน้าสร้าง Workflow (Create Page)

**File**: `new/page.tsx`

- ฟอร์มกรอก 4 ฟิลด์:
  - **Workflow Name** - ชื่อ workflow (text input)
  - **Workflow Type** - ประเภท (select: Purchase Request, Store Requisition, Purchase Order)
  - **Status** - สถานะ (toggle switch: Active/Inactive)
  - **Description** - คำอธิบาย (text input)
- สร้าง UUID อัตโนมัติสำหรับ workflow ใหม่
- ตั้งค่า `document_reference_pattern: "PR-{YYYY}-{MM}-{####}"` เป็น default
- สร้าง 2 default stages อัตโนมัติ:
  - **"Create Request"** - stage แรก (role=create, SLA=24hrs, submit enabled, requestor+next_step=true)
  - **"Completed"** - stage สุดท้าย (role=approve, SLA=0, ไม่มี actions)
- แสดง "Default Configuration" info card อธิบายว่าจะสร้าง stages อะไรบ้าง
- กดปุ่ม "Create Workflow" → POST API → `router.replace` ไปหน้า Edit (แสดง "Creating..." ขณะ pending)
- กดปุ่ม "Cancel" → กลับไปหน้า List

### 3. หน้าแก้ไข Workflow (Edit Page)

**File**: `[id]/page.tsx` → `WorkflowDetail.tsx`

- โหลดข้อมูล 3 อย่างพร้อมกัน:
  - ข้อมูล workflow (`useWorkflowDetail`)
  - รายชื่อ users (`useUserList`)
  - รายการ products (`useProductQuery`)
- แสดง Loading state ขณะโหลดข้อมูล
- มีโหมด View/Edit toggle ผ่านปุ่ม Edit
- ใช้ React Hook Form + Zod validation จัดการ form

#### Header (`WorkflowHeader.tsx`)
- แสดง: ชื่อ workflow, status badge, ID
- โหมด View: แสดงชื่อ workflow + Badge (เฉพาะเมื่อ Active เท่านั้น — Inactive ไม่แสดง Badge) + ID + Type + Description
  - ปุ่ม Edit, Duplicate (ยังไม่ได้ implement - ไม่มี onClick), Delete (ไม่มี confirm dialog - ลบทันที)
- โหมด Edit: แสดง "Edit Workflow" title + ID + Description
  - ปุ่ม Cancel (variant=ghost), Save Changes (type=submit, ใช้ form.handleSubmit)

#### Tab 1: General (`WorkflowGeneral.tsx`)
- ฟิลด์: Workflow Name, Type (select), Status (switch), Description (textarea)

#### Tab 2: Stages (`WorkflowStages.tsx`)
- แบ่ง 2 ฝั่ง: **Stage List** (ซ้าย) | **Stage Detail** (ขวา)
- **StageList.tsx**: รายการ stages แบบ sortable ด้วย `@dnd-kit` (drag-and-drop)
  - Stage แรกและสุดท้ายล็อคตำแหน่ง (ลากไม่ได้)
  - เพิ่ม stage ใหม่ได้ระหว่าง stage แรกกับสุดท้าย (insert at `fields.length - 1`)
  - Stage ใหม่ default: name="New Stage N" (deduplication), SLA=24 hours, role=approve, approve/reject/sendback enabled, submit disabled
  - Approve recipients default: requestor=true, next_step=true | Reject/SendBack recipients default: requestor=true only
  - DragOverlay แสดง card พร้อม grip icon + ชื่อ stage ขณะลาก
- **StageDetailPanel.tsx**: แก้ไขรายละเอียด stage แบ่ง 3 sub-tabs:
  - **General**: Stage Name, Description, Role (create/approve/purchase/issue), Creator Access (แสดงเฉพาะ stage แรกเท่านั้น - RadioGroup: only_creator/all_department), SLA (จำนวน + หน่วย), Available Actions, Hide Fields (price_per_unit, total_price)
  - **Notifications**: ตั้งค่า notification ต่อ action (ดูรายละเอียด recipient ด้านล่าง), เลือก template (hardcoded i18n keys - ไม่เชื่อมกับ WorkflowTemplates/mockData), SLA Warning notification (แสดงเฉพาะ !isFirstStage)
  - **Assigned Users**: checkbox "Is HOD" (แสดงเฉพาะ stage กลาง - !isFirstStage && !isLastStage), ค้นหา users (firstname/middlename/lastname/email), Bulk actions (Assign All/Unassign All + Assign Filtered/Unassign Filtered เมื่อมี search), Filter button (ยังไม่ implement - ไม่มี onClick), ปุ่ม Assign/Unassign ต่อ user

  **Conditional visibility ตาม stage position:**
  | Element | First Stage | Middle Stages | Last Stage |
  |---------|------------|---------------|------------|
  | Tabs (General/Notifications/Assigned Users) | แสดง | แสดง | ไม่แสดง (แสดง completed icon เท่านั้น) |
  | Delete Stage button | ซ่อน | แสดง | ซ่อน |
  | Creator Access (RadioGroup) | แสดง | ซ่อน | ซ่อน |
  | Available Actions: Submit | แสดง | แสดง | - |
  | Available Actions: Approve/Reject/SendBack | ซ่อน | แสดง (Approve=สีเขียว, SendBack=สีเหลือง, Reject=สีแดง) | - |
  | Notifications: Submit | แสดง (เมื่อ submit is_active) | แสดง (เมื่อ submit is_active) | - |
  | Notifications: Approve/Reject/SendBack | ซ่อน | แสดง (เมื่อ action is_active) | - |
  | Notifications: SLA Warning | ซ่อน | แสดง | - |
  | Is HOD checkbox | ซ่อน | แสดง | ซ่อน |

  **Notification recipients ต่อ action:**
  | Action | Recipient 1 | Recipient 2 | Recipient 3 |
  |--------|------------|------------|------------|
  | Submit | Requestor | Current Approver | Next Stage Approver |
  | Approve | Requestor | Current Approver | Next Stage Approver |
  | Reject | Requestor | Previous Stage Approvers | - |
  | Send Back | Requestor | Previous Stage Approvers | Send Back Stage Approvers |
  | SLA Warning | Requestor | Current Approver | - |

  **Is HOD behavior**: เมื่อ check จะ clear assigned_users เป็น [] และแสดง Lock icon + ข้อความว่า user assignment ถูก disable

#### Tab 3: Routing (`WorkflowRouting.tsx`)
- แบ่ง 2 ฝั่ง: **Rule List** (ซ้าย) | **Rule Detail** (ขวา)
- สร้าง routing rules เพื่อ skip หรือ route ไปยัง stage ที่กำหนด
- Rule ใหม่ default: name="New Rule N", trigger_stage=ชื่อ stage แรก, condition=(field:"", operator:"eq", value:[]), action={type:"NEXT_STAGE", target_stage:"Completed"}
- ลบ rule ไม่มี confirmation dialog (ลบทันที)
- เมื่อไม่มี rules แสดง empty state message
- ตั้งค่า Rule:
  - **Name & Description**
  - **Trigger Stage** - stage ที่ trigger rule นี้ (select จากรายชื่อ stages ทั้งหมด)
  - **Condition**: Field (total_amount/department/category)
    - total_amount: Operator ทุกตัว (eq/gt/lt/gte/lte/between), Value เป็น number. เมื่อ between แสดง min_value/max_value 2 ช่อง
    - department: Operator=eq เท่านั้น, Value=MultiSelect จาก departments list
    - category: Operator=eq เท่านั้น, Value=MultiSelect จาก categories list
    - เมื่อเปลี่ยน field จะ reset operator เป็น "eq" และ clear value
  - **Action**: Type (SKIP_STAGE/NEXT_STAGE), Target Stage (select จากรายชื่อ stages)

#### Tab 4: Products (`WorkflowProducts.tsx`)
- Tree view แสดง products แบบ 4 ระดับ: Category > Sub-category > Item Group > Products
- ค้นหาด้วยชื่อหรือรหัส
- เลือกด้วย checkbox (recursive ลงไป children)
- Auto-expand 2 ระดับแรก
- Debounced auto-save (300ms) + immediate save เมื่อ component unmount (เช่น เปลี่ยน tab)

### 4. Templates (`WorkflowTemplates.tsx`)
- อยู่ใน tab "Templates" ของหน้า List
- แบ่ง 2 ฝั่ง: **Template List** (ซ้าย) | **Template Editor** (ขวา)
- CRUD notification templates
- แทรก variables สำหรับ dynamic content:
  - Request info: number, date, type, status, amount
  - User info: requester/approver name, department, email
  - Workflow info: current/next/previous stage, due date, SLA
  - System info: date, time, company name, URL

---

## API Endpoints

### Base URL Pattern
```
${backendApi}/api/config/${buCode}/workflows
```

### Endpoints ที่ใช้

| Method | Endpoint | Description | ใช้ที่ |
|--------|----------|-------------|--------|
| `GET` | `/api/config/{buCode}/workflows` | ดึงรายการ workflows ทั้งหมด (รองรับ query params: search, page, perpage, sort, filter) | `useWorkflow` hook, `WorkflowComponent` |
| `GET` | `/api/config/{buCode}/workflows/{id}` | ดึง workflow ตาม ID | `useWorkflowIdQuery`, `useWorkflowDetail` |
| `POST` | `/api/config/{buCode}/workflows` | สร้าง workflow ใหม่ | `useCreateWorkflowMutation`, `useWorkflowMutation` |
| `PUT` | `/api/config/{buCode}/workflows/{id}` | อัปเดต workflow | `useUpdateWorkflowMutation` |
| `DELETE` | `/api/config/{buCode}/workflows/{id}` | ลบ workflow | `deleteWorkflow` (service) |
| `GET` | `/api/{buCode}/workflow/type/{type}` | ดึง workflows ตามประเภท | `useWorkflowTypeQuery` |

### API Response Format (List)
```typescript
{
  data: WorkflowDto[],
  paginate: {
    total: number,
    pages: number,
    current_page: number
  }
}
```

---

## ไฟล์ที่เกี่ยวข้องทั้งหมด

### Module Files (18 files)

| # | File | ประเภท | หน้าที่ |
|---|------|--------|---------|
| 1 | `workflow-management/page.tsx` | Page | หน้า List แสดงรายการ workflows |
| 2 | `workflow-management/new/page.tsx` | Page | หน้า Create workflow ใหม่ |
| 3 | `workflow-management/[id]/page.tsx` | Page | หน้า Edit/View workflow |
| 4 | `_components/WorkflowComponent.tsx` | Component | Container หน้า List (tabs, search, filter, pagination) |
| 5 | `_components/WorkflowList.tsx` | Component | Data Grid แสดงรายการ workflows |
| 6 | `_components/WorkflowDetail.tsx` | Component | Container หน้า Edit (tabs, form state, validation) |
| 7 | `_components/WorkflowHeader.tsx` | Component | Header พร้อมปุ่ม actions |
| 8 | `_components/WorkflowGeneral.tsx` | Component | Tab ข้อมูลทั่วไป |
| 9 | `_components/WorkflowStages.tsx` | Component | Tab จัดการ stages |
| 10 | `_components/StageList.tsx` | Component | Sidebar รายการ stages (sortable) |
| 11 | `_components/StageDetailPanel.tsx` | Component | Panel แก้ไข stage |
| 12 | `_components/WorkflowRouting.tsx` | Component | Tab กำหนด routing rules |
| 13 | `_components/WorkflowProducts.tsx` | Component | Tab กำหนดสินค้า (tree view) |
| 14 | `_components/WorkflowNotifications.tsx` | Component | ตั้งค่า notifications (ยังไม่ได้ถูก import ใช้งาน - อาจถูกแทนที่ด้วย notifications ใน StageDetailPanel) |
| 15 | `_components/WorkflowStageNotification.tsx` | Component | Notification เฉพาะ stage (ยังไม่ได้ถูก import ใช้งาน - อาจถูกแทนที่ด้วย notifications ใน StageDetailPanel) |
| 16 | `_components/WorkflowTemplates.tsx` | Component | จัดการ notification templates |
| 17 | `_hook/use-workflow-detail.ts` | Hook | Fetch workflow by ID + login dialog |
| 18 | `data/mockData.ts` | Data | Mock data สำหรับ notification templates |

### External Dependencies (3 files)

| # | File | ประเภท | หน้าที่ |
|---|------|--------|---------|
| 1 | `hooks/use-workflow.ts` | Hook | React Query hooks สำหรับ CRUD (useWorkflow, useWorkflowIdQuery, useCreateWorkflowMutation, useUpdateWorkflowMutation, useWorkflowMutation, useWorkflowTypeQuery) |
| 2 | `services/workflow.ts` | Service | Service layer เรียก API โดยตรง (5 functions แต่มีเพียง `deleteWorkflow` ที่ถูกใช้จริง ดู Known Issues #12) |
| 3 | `dtos/workflows.dto.ts` | DTO/Types | Type definitions, interfaces, enums, Zod validation schema (wfFormSchema) |

### Shared Dependencies (ใช้จาก modules อื่น)

#### Hooks & Context

| File | ใช้ทำอะไร | ใช้ใน |
|------|----------|-------|
| `hooks/useUserList.ts` | ดึงรายชื่อ users สำหรับ assign ใน stages | `[id]/page.tsx` |
| `hooks/use-product-query.ts` | ดึงรายการ products สำหรับ tab Products | `[id]/page.tsx` |
| `hooks/use-category.ts` | ดึงรายการ categories สำหรับ routing rules | `WorkflowRouting` |
| `hooks/use-departments.ts` | ดึงรายการ departments สำหรับ routing rules | `WorkflowRouting` |
| `hooks/use-list-page-state.ts` | จัดการ state ของ list page (search, filter, sort, pagination) | `WorkflowComponent` |
| `context/AuthContext.tsx` | ดึง token, buCode สำหรับ auth | หลายไฟล์ |

#### Services & DTOs

| File | ใช้ทำอะไร | ใช้ใน |
|------|----------|-------|
| `lib/backend-api.ts` | Base URL ของ backend API | `use-workflow.ts`, `services/workflow.ts` |
| `lib/config.api.ts` | Helper functions สำหรับ API requests (getAllApiRequest, getByIdApiRequest, postApiRequest, updateApiRequest) | `use-workflow.ts` |
| `lib/navigation.ts` | Link component + useRouter สำหรับ i18n navigation | `WorkflowComponent`, `WorkflowDetail`, `new/page.tsx` |
| `lib/utils.ts` | `cn` utility สำหรับ className merge | `WorkflowProducts` |
| `dtos/form.dto.ts` | Enum formType (ADD/EDIT) | `WorkflowDetail`, `[id]/page.tsx` |
| `dtos/param.dto.ts` | Type ParamsGetDto สำหรับ query parameters | `use-workflow.ts` |
| `dtos/product.dto.ts` | Type ProductListDto สำหรับ product list | `WorkflowDetail` |

#### UI Components (custom)

| File | ใช้ทำอะไร | ใช้ใน |
|------|----------|-------|
| `components/templates/DataDisplayTemplate.tsx` | Template layout สำหรับหน้า list | `WorkflowComponent` |
| `components/SignInDialog.tsx` | Dialog แสดงเมื่อ auth fail | `[id]/page.tsx` |
| `components/loading/DetailLoading.tsx` | Loading skeleton สำหรับหน้า detail | `[id]/page.tsx` |
| `components/ui-custom/Toast.ts` | `toastSuccess`, `toastError` สำหรับ feedback | `new/page.tsx` (ทั้ง success+error), `WorkflowDetail` (เฉพาะ success) |
| `components/ui-custom/SearchInput.tsx` | Search input component | `WorkflowComponent` |
| `components/form-custom/StatusSearchDropdown.tsx` | Status filter dropdown | `WorkflowComponent` |
| `components/ui-custom/SortComponent.tsx` | Sort dropdown component | `WorkflowComponent` |
| `components/ButtonLink.tsx` | Link ที่แสดงเป็นปุ่มสำหรับคลิกชื่อ workflow | `WorkflowList` |
| `components/ui-custom/StatusCustom.tsx` | Badge แสดง status Active/Inactive | `WorkflowList` |
| `components/error-ui/` | Error pages (Unauthorized, Forbidden, InternalServerError) | `WorkflowComponent` |
| `components/ui/multi-select.tsx` | MultiSelect สำหรับเลือก departments/categories | `WorkflowRouting` |
| `components/form-custom/form.tsx` | Custom Form, FormField, FormControl, FormLabel, FormMessage | หลายไฟล์ |
| `components/ui/data-grid*.tsx` | DataGrid, DataGridContainer, DataGridTable, DataGridPagination, DataGridColumnHeader | `WorkflowList` |
| `components/ui/scroll-area.tsx` | ScrollArea, ScrollBar สำหรับ scrollable table | `WorkflowList` |

#### Constants & Utilities

| File | ใช้ทำอะไร | ใช้ใน |
|------|----------|-------|
| `constants/fields.ts` | roleField, slaUnitField สำหรับ dropdowns | `StageDetailPanel` |
| `constants/uiConfig.ts` | `FieldConfig` type สำหรับ sort fields | `WorkflowComponent` |
| `utils/metadata.ts` | `createMetadata` สำหรับ page metadata | `page.tsx` |
| `utils/table.ts` | `parseSortString` แปลง sort string | `WorkflowComponent` |
| `utils/error.ts` | `getApiErrorType` จัดประเภท API error | `WorkflowComponent` |

---

## State Management

### Server State (TanStack React Query)
- **Query Keys**:
  - `["workflows", buCode, params]` - รายการ workflows
  - `["workflow", buCode, id]` - workflow เดี่ยว
  - `["workflow", buCode, type]` - workflows ตามประเภท
- **Mutations**: Create, Update ผ่าน `useMutation`
- **Cache**: staleTime = 5 นาที
- **Auto-invalidation**: invalidate queries เมื่อ mutation สำเร็จ

### Form State (React Hook Form + Zod)
- จัดการ form state ทั้ง workflow object
- Nested fields: `data.stages.0.name`, `data.routing_rules.0.condition.field`
- Zod schema validation (`wfFormSchema`)

### Local Component State
- `isEditing` - toggle โหมด edit/view
- `selectedStageIndex` - stage ที่เลือกอยู่
- `selectedRuleIndex` - rule ที่เลือกอยู่
- `activeDragId` - drag state ของ dnd-kit
- `searchQuery` - ค้นหา users
- `productTree`, `expandedIds`, `searchTerm` - state ของ tree view

### URL State (Query Params)
- `page`, `search`, `sort`, `filter`, `tab` - จัดการผ่าน `useListPageState`

---

## Data Flow

### สร้าง Workflow
```
User กรอกฟอร์ม → Submit → Zod Validation → useWorkflowMutation
→ POST /api/config/{buCode}/workflows → Success → Invalidate Cache
→ Redirect ไป /workflow-management/{id}
```

### แก้ไข Workflow
```
Navigate to /workflow-management/{id} → useWorkflowDetail (fetch data)
→ + useUserList (fetch users) → + useProductQuery (fetch products)
→ React Hook Form initialized → User แก้ไข → Save Changes
→ Zod Validation → useUpdateWorkflowMutation
→ PUT /api/config/{buCode}/workflows/{id} → Success → Invalidate Cache → Refetch
```

### ลบ Workflow
```
User กด Delete → deleteWorkflow service (ไม่มี confirm dialog)
→ DELETE /api/config/{buCode}/workflows/{id} → Success → Invalidate Cache → router.back()
```
หมายเหตุ: Stage delete มี AlertDialog confirmation แต่ Workflow delete ไม่มี

---

## Libraries ที่ใช้

| Library | ใช้ทำอะไร |
|---------|----------|
| `@tanstack/react-query` | Server state management, caching, mutations |
| `@tanstack/react-table` | Data Grid สำหรับ workflow list |
| `react-hook-form` | Form state management |
| `zod` + `@hookform/resolvers/zod` | Form validation |
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | Drag-and-drop stages |
| `@radix-ui/*` | UI primitives (dropdown, dialog, tabs, select, switch) |
| `lucide-react` | Icons |
| `next-intl` | Internationalization (i18n) |
| `uuid` | UUID generation |
| `next/navigation` | Next.js routing |

---

## Type Definitions สำคัญ

### Enums
```typescript
enum enum_workflow_type {
  purchase_request = "purchase_request_workflow"
  purchase_order = "purchase_order_workflow"
  store_requisition = "store_requisition_workflow"
}

enum enum_available_actions { submit, approve, reject, sendback }
enum enum_sla_unit { minutes, hours, days }

type Role = "create" | "approve" | "purchase" | "issue"
type CreatorAccess = "only_creator" | "all_department"
type OperatorType = "eq" | "lt" | "gt" | "lte" | "gte" | "between"
type ActionType = "SKIP_STAGE" | "NEXT_STAGE"
```

### Main Interfaces
```typescript
interface WorkflowCreateModel {
  id?: string
  name: string
  workflow_type: enum_workflow_type
  is_active: boolean
  description?: string
  data?: WorkflowData              // optional ตาม Zod schema
}

interface WorkflowData {
  document_reference_pattern: string
  stages: Stage[]
  routing_rules: RoutingRule[]
  notifications: WorkflowNotification[]
  notification_templates: Template[]
  products: Product[]
}

interface Stage {
  name: string
  description?: string
  sla: string
  sla_unit: string
  role: string
  creator_access?: string
  available_actions: AvailableActions
  hide_fields: HideFields
  assigned_users?: User[]
  is_hod?: boolean
  sla_warning_notification?: SLAWarningNotification
}

interface RoutingCondition {
  field: string
  operator: OperatorType
  value: string[]
  min_value?: string    // ใช้เมื่อ operator = "between"
  max_value?: string    // ใช้เมื่อ operator = "between"
}

interface RoutingAction {
  type: ActionType
  parameters: { target_stage: string }
}

interface RoutingRule {
  id: number            // หมายเหตุ: มีใน interface แต่ไม่มีใน Zod schema
  name: string
  description: string
  trigger_stage: string
  condition: RoutingCondition
  action: RoutingAction
}
```

---

## Notes / Known Issues

1. **WorkflowComponent.tsx** - export function ชื่อ `PurchaseOrderComponent` (naming inconsistency กับชื่อไฟล์ `WorkflowComponent.tsx`)
2. **WorkflowList.tsx** - Dropdown actions (Print, Export, Delete) ยังเป็น `console.log` เท่านั้น ยังไม่ได้ implement
3. **WorkflowHeader.tsx** - ปุ่ม Duplicate ไม่มี onClick handler ยังไม่ได้ implement
4. **WorkflowDetail.tsx** - import `handleSubmit` จาก `@/services/workflow` แต่ไม่ได้ใช้งาน (dead import) ใช้ mutation hooks แทน
5. **WorkflowDetail.tsx** - ลบ workflow ไม่มี confirmation dialog (ลบทันทีเมื่อกดปุ่ม Delete)
6. **WorkflowNotifications.tsx** และ **WorkflowStageNotification.tsx** - ไม่ได้ถูก import ใช้งานจาก component ใดเลย notification logic ถูก built-in อยู่ใน `StageDetailPanel.tsx` โดยตรง
7. **WorkflowTemplates.tsx** - ใช้ mock data จาก `mockData.ts` (local state) ยังไม่ได้เชื่อมต่อกับ API จริง (save เป็น `console.log`)
8. **StageDetailPanel.tsx** - Filter button ใน tab Assigned Users ไม่มี onClick handler (ยังไม่ implement)
9. **StageDetailPanel.tsx** - Template select ใช้ hardcoded i18n keys (submit-template-1, approve-template-1, etc.) ไม่เชื่อมกับ WorkflowTemplates.tsx หรือ mockData.ts — เป็นระบบที่แยกกันอยู่
10. **WorkflowStages.tsx** - `handleActionToggle` function ถูก commented out ทั้งหมด (dead code, lines 174-193) และ `//onSave(updatedStages)` ใน handleDeleteStage ก็ commented out
11. **StageDetailPanel.tsx** - มี commented-out debug style `//style={{ backgroundColor: "red" }}` ที่ user avatar (line 1029)
12. **services/workflow.ts** - จาก 5 functions มีเพียง `deleteWorkflow` ที่ถูกใช้จริง อีก 4 ตัวเป็น dead code:
    - `getWorkflowList` → ไม่ถูก import (hooks ใช้ `getAllApiRequest` จาก config.api แทน)
    - `getWorkflowId` → ไม่ถูก import (hooks ใช้ `getByIdApiRequest` จาก config.api แทน)
    - `createWorkflow` → ไม่ถูก import (ใช้ `useWorkflowMutation` / `useCreateWorkflowMutation` แทน)
    - `handleSubmit` → import ใน WorkflowDetail แต่ไม่เคยถูกเรียกใช้ (dead import)
13. **Copy-paste errors จาก modules อื่น (3 จุด):**
    - `new/page.tsx:178` - `console.error("Error creating vendor:", error)` → ควรเป็น "workflow"
    - `use-workflow.ts:150` (useWorkflowMutation) - `"Error creating vendor"` → ควรเป็น "workflow"
    - `use-workflow.ts:134` (useUpdateWorkflowMutation) - `"Error updating product"` → ควรเป็น "workflow"
14. **WorkflowDetail.tsx:229** - `throw new Error("Product ID is required for update")` → ควรเป็น "Workflow ID"
15. **WorkflowDetail.tsx:185-189** - `handleSave` function ถูก commented out ทั้งหมด (dead code)
16. **WorkflowDetail.tsx** - Default values สำหรับ ADD mode ใช้ชื่อ "Request Creation" แต่ `new/page.tsx` ใช้ "Create Request" (inconsistent แต่ไม่กระทบเพราะ ADD path ใน WorkflowDetail ไม่ถูกใช้จริง - mode จะเป็น EDIT เสมอจาก [id]/page.tsx)
17. **WorkflowComponent.tsx** - `refetchWorkflows` function (line 44-49) ถูกประกาศแต่ไม่เคยถูกเรียกใช้ (dead code)
18. **WorkflowRouting.tsx** - ลบ routing rule ไม่มี confirmation dialog (เหมือน workflow delete)
19. **WorkflowStages.tsx:27-32** - ประกาศ `enum_available_actions` ซ้ำกับที่มีใน `dtos/workflows.dto.ts` (unnecessary duplication)
20. **WorkflowDetail.tsx** - ไม่มี `toastError` เมื่อ save/update ล้มเหลว (catch block line 244-247 ใช้แค่ `console.error` + `console.log` — ไม่มี feedback ให้ user เห็น) ต่างจาก `new/page.tsx` ที่ใช้ `toastError`
21. **WorkflowHeader.tsx:47** - Badge สถานะแสดงเฉพาะเมื่อ `is_active=true` เมื่อ workflow เป็น Inactive จะไม่แสดง Badge เลย (ควรแสดง Badge "Inactive" ด้วย)
22. **WorkflowComponent.tsx:11** - `useRouter` imported จาก `@/lib/navigation` แต่ไม่เคยถูกเรียกใช้ (dead import — แยกจาก issue #17 ที่เป็นเรื่อง `refetchWorkflows`)
23. **WorkflowDetail.tsx:191-204** - `handleDelete` ไม่มี toast feedback ทั้ง success และ failure — ใช้เฉพาะ `console.log("Successfully deleted")` และ `console.log("Failed to delete")` ไม่มี `toastSuccess`/`toastError` ให้ user เห็น (issue #20 ครอบคลุมเฉพาะ save/update ยังไม่รวม delete)
24. **new/page.tsx** - Description field ใช้ `<Input>` (single-line) แต่ `WorkflowGeneral.tsx` ใช้ `<Textarea>` (multi-line) สำหรับฟิลด์ Description เดียวกัน (inconsistent ระหว่าง create mode กับ edit mode)
25. **StageDetailPanel.tsx:721** - Reject notification template select ใช้ `stage` (prop) แทน `editedStage` (local state) ต่างจาก Submit/Approve/SendBack/SLA Warning ที่ใช้ `editedStage` ทั้งหมด — อาจทำให้ UI ไม่ update ทันทีเมื่อเปลี่ยน reject template (bug)
