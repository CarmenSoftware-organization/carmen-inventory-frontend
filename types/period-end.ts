export interface CreatePeriodEndDto {
  pe_no: string;
}

export interface PeriodEnd {
  id: string;
  pe_no: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
