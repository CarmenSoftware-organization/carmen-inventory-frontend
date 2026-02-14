import { Bell } from "lucide-react";
import { Button } from "../ui/button";

export default function NotificationComponent() {
  return (
    <Button variant="ghost" size="icon" className="size-7">
      <Bell className="hidden size-4 md:block" />
    </Button>
  );
}
