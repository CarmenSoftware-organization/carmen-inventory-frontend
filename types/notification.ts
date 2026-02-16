export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "error" | "warning" | "success";
  created_at: string;
  link?: string;
}
