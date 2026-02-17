export interface UserDetail {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  application_roles: { application_role_id: string }[];
}
