import { z } from "zod";

export enum WORKFLOW_TYPE {
  PR = "purchase_request_workflow",
  PO = "purchase_order_workflow",
  SR = "store_requisition_workflow",
}

export const workflowTypeField = [
  { label: "Purchase Request", value: WORKFLOW_TYPE.PR },
  { label: "Store Requisition", value: WORKFLOW_TYPE.SR },
  { label: "Purchase Order", value: WORKFLOW_TYPE.PO },
];

export enum enum_available_actions {
  submit = "submit",
  approve = "approve",
  reject = "reject",
  sendback = "sendback",
}

export enum enum_sla_unit {
  minutes = "minutes",
  hours = "hours",
  days = "days",
}

export type SlaUnit = `${enum_sla_unit}`;
export type Role = "create" | "approve" | "purchase" | "issue";
export type CreatorAccess = "only_creator" | "all_department";

export type OperatorType = "eq" | "lt" | "gt" | "lte" | "gte" | "between";
export type ActionType = "SKIP_STAGE" | "NEXT_STAGE";
export type NotificationChannel = "Email" | "System";
export type NotificationEventTrigger =
  | "onSubmit"
  | "onApprove"
  | "onReject"
  | "onSendBack"
  | "onSLA";

export type PageMode = "add" | "edit" | "view";

export interface Product {
  id: string;
  code: string;
  name: string;
  local_name?: string;
  description?: string | null;
  product_status_type?: string;
  inventory_unit_id: string;
  inventory_unit_name: string;
  product_item_group: {
    id: string;
    name: string;
  };
  product_sub_category: {
    id: string;
    name: string;
  };
  product_category: {
    id: string;
    name: string;
  };
}

export interface Recipients {
  requestor: boolean;
  current_approve: boolean;
  next_step: boolean;
}

export interface Action {
  is_active: boolean;
  recipients: Recipients;
  template?: string;
}

export interface AvailableActions {
  submit: Action;
  approve: Action;
  reject: Action;
  sendback: Action;
}

export interface HideFields {
  price_per_unit: boolean;
  total_price: boolean;
}

export interface SLAWarningNotification {
  recipients: {
    requestor: boolean;
    current_approve: boolean;
  };
  template?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  user_id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  department: Department;
  initials: string;
}

export interface Stage {
  name: string;
  description?: string;
  sla: string;
  sla_unit: SlaUnit;
  role: Role;
  creator_access?: CreatorAccess;
  available_actions: AvailableActions;
  hide_fields: HideFields;
  assigned_users?: User[];
  is_hod?: boolean;
  sla_warning_notification?: SLAWarningNotification;
}

export interface RoutingCondition {
  field: string;
  operator: OperatorType;
  value: string[];
  min_value?: string;
  max_value?: string;
}

export interface RoutingAction {
  type: ActionType;
  parameters: {
    target_stage: string;
  };
}

export interface RoutingRule {
  id: number;
  name: string;
  description: string;
  trigger_stage: string;
  condition: RoutingCondition;
  action: RoutingAction;
}

export interface WorkflowDto {
  id: string;
  name: string;
  stages: number;
  rules: number;
  workflow_type: string;
  is_active: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  workflow_type: string;
  data: WorkflowData;
  is_active: boolean;
  description: string;
  note: null;
  info: object;
  dimension: object;
  created_at: string;
  created_by_id: string | null;
  updated_at: string;
  updated_by_id: string | null;
  deleted_at: string | null;
  deleted_by_id: string | null;
}

export interface WorkflowNotification {
  id: number;
  event?: string;
  event_trigger?: NotificationEventTrigger;
  description?: string;
  recipients?: string[];
  channels?: NotificationChannel[];
}

export interface Template {
  id: number;
  name: string;
  event_trigger: NotificationEventTrigger;
  description?: string;
  subject_line: string;
  content: string;
}

export interface WorkflowData {
  document_reference_pattern: string;
  stages: Stage[];
  routing_rules: RoutingRule[];
  notifications: WorkflowNotification[];
  notification_templates: Template[];
  products: Product[];
}

export const wfFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1).max(50),
  workflow_type: z.string(),
  is_active: z.boolean(),
  data: z
    .object({
      document_reference_pattern: z.string(),
      stages: z.array(
        z.object({
          name: z.string().min(1).max(50),
          description: z.string().optional(),
          sla: z.string(),
          sla_unit: z.string(),
          role: z.string().optional(),
          creator_access: z.string().optional(),
          available_actions: z.object({
            submit: z.object({
              is_active: z.boolean(),
              recipients: z.object({
                requestor: z.boolean(),
                current_approve: z.boolean(),
                next_step: z.boolean(),
              }),
            }),
            approve: z.object({
              is_active: z.boolean(),
              recipients: z.object({
                requestor: z.boolean(),
                current_approve: z.boolean(),
                next_step: z.boolean(),
              }),
            }),
            reject: z.object({
              is_active: z.boolean(),
              recipients: z.object({
                requestor: z.boolean(),
                current_approve: z.boolean(),
                next_step: z.boolean(),
              }),
            }),
            sendback: z.object({
              is_active: z.boolean(),
              recipients: z.object({
                requestor: z.boolean(),
                current_approve: z.boolean(),
                next_step: z.boolean(),
              }),
            }),
          }),
          hide_fields: z.object({
            price_per_unit: z.boolean(),
            total_price: z.boolean(),
          }),
          assigned_users: z
            .array(
              z.object({
                user_id: z.string(),
                firstname: z.string(),
                middlename: z.string(),
                lastname: z.string(),
                email: z.string(),
                department: z
                  .object({
                    id: z.string().optional(),
                    name: z.string().optional(),
                  })
                  .optional(),
                initials: z.string(),
              }),
            )
            .optional(),
          is_hod: z.boolean().optional(),
          sla_warning_notification: z
            .object({
              recipients: z.object({
                requestor: z.boolean(),
                current_approve: z.boolean(),
              }),
              template: z.string().optional(),
            })
            .optional(),
        }),
      ),
      routing_rules: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          trigger_stage: z.string(),
          condition: z.object({
            field: z.string(),
            operator: z.enum(["eq", "lt", "gt", "lte", "gte", "between"]),
            value: z.array(z.string()),
            min_value: z.string().optional(),
            max_value: z.string().optional(),
          }),
          action: z.object({
            type: z.enum(["SKIP_STAGE", "NEXT_STAGE"]),
            parameters: z.object({ target_stage: z.string() }),
          }),
        }),
      ),
      notifications: z.array(z.object({})),
      notification_templates: z.array(z.object({})),
      products: z.array(
        z.object({
          id: z.string(),
          code: z.string(),
          name: z.string(),
          local_name: z.string().optional(),
          description: z.nullable(z.string()).optional(),
          product_status_type: z.string().optional(),
          inventory_unit_id: z.string(),
          inventory_unit_name: z.string(),
          isAssigned: z.boolean().optional(),
          product_item_group: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .optional(),
          product_sub_category: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .optional(),
          product_category: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .optional(),
        }),
      ),
    }),
  description: z.string().optional(),
});

export type WorkflowCreateModel = z.infer<typeof wfFormSchema>;
