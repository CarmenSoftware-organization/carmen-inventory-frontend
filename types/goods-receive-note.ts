export interface GoodsReceiveNoteItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface GrnItemPayload {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateGrnDto {
  grn_number: string;
  grn_date: string;
  vendor_id: string;
  po_id?: string;
  description?: string;
  items: {
    add?: GrnItemPayload[];
    update?: (GrnItemPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export interface GoodsReceiveNote {
  id: string;
  grn_number: string;
  grn_date: string;
  vendor_id: string;
  vendor_name: string;
  po_id: string;
  description: string;
  total_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: GoodsReceiveNoteItem[];
}
