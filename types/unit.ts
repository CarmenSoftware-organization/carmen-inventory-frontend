export interface Unit {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  info: Record<string, unknown>;
  dimension: unknown[];
  created_at: string;
  updated_at: string;
}
