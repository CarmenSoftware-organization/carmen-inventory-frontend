export interface CreateSpotCheckDto {
  department_id: string;
}

export interface SpotCheck {
  id: string;
  department_id: string;
  department_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
