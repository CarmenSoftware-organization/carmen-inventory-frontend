import type {
  PurchaseRequest,
  PurchaseRequestDetail,
} from "./purchase-request";

/** An approval item is a PurchaseRequest pending the current user's action */
export type ApprovalItem = PurchaseRequest;

/** Re-export detail for convenience */
export type ApprovalItemDetail = PurchaseRequestDetail;

/** Payload for approve/reject actions */
export interface ApprovalActionPayload {
  id: string;
  state_role: string;
  details: ApprovalStageDetail[];
}

export interface ApprovalStageDetail {
  id: string;
  stage_status: string;
  stage_message: string;
}
