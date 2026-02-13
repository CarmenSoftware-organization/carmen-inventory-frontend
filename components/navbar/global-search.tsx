import { Search } from "lucide-react";
import { Input } from "../ui/input";

export default function GlobalSearch() {
  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="Search..." className="w-64 pl-8" />
    </div>
  );
}
