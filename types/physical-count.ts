export interface CreatePhysicalCountDto {
  department_id: string;
}

export interface PhysicalCount {
  id: string;
  department_id: string;
  department_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
