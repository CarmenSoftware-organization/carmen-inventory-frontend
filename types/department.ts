export interface DepartmentUser {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  middlename: string;
  telephone: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  department_users: DepartmentUser[];
  hod_users: DepartmentUser[];
  created_at: string;
  updated_at: string;
}
