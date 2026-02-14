"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { moduleList } from "@/constant/module-list";
import { cn } from "@/lib/utils";

export default function ModuleApp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <LayoutGrid className="size-4" />
          <span className="sr-only">Modules</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-72 max-h-80 overflow-y-auto p-2"
      >
        <div className="grid grid-cols-3 gap-0.5">
          {moduleList.map((mod) => {
            const isActive = pathname.startsWith(mod.path);
            return (
              <Link
                key={mod.path}
                href={mod.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-1 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground font-semibold",
                )}
              >
                <mod.icon className="size-4" />
                <span className="text-[10px] leading-tight text-center truncate w-full">
                  {mod.name}
                </span>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
