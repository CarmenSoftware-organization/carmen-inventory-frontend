export interface CreditNoteItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  description: string;
}

export type CreditNoteType = "quantity_return" | "amount_discount";

export interface CnItemPayload {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  description: string;
}

export interface CreateCnDto {
  credit_note_type: CreditNoteType;
  grn_id: string;
  vendor_id: string;
  credit_note_number: string;
  credit_note_date: string;
  reference_number: string;
  description?: string;
  currency_code: string;
  exchange_rate: number;
  tax_amount: number;
  discount_amount: number;
  notes?: string;
  items: {
    add?: CnItemPayload[];
    update?: (CnItemPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export interface CreditNote {
  id: string;
  credit_note_type: CreditNoteType;
  grn_id: string;
  credit_note_number: string;
  credit_note_date: string;
  vendor_id: string;
  vendor_name: string;
  reference_number: string;
  description: string;
  currency_code: string;
  exchange_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: CreditNoteItem[];
}
