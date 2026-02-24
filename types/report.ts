export type ReportType = "procurement" | "recipe" | "inventory" | "other";

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  // TODO: เพิ่ม fields เมื่อ API พร้อม
  // is_active: boolean;
  // created_at: string;
  // updated_at: string;
}
