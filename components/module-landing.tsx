import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SubModule {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface ModuleLandingProps {
  name: string;
  icon: LucideIcon;
  description: string;
  subModules: SubModule[];
}

export function ModuleLanding({
  name,
  icon: Icon,
  description,
  subModules,
}: ModuleLandingProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">{name}</h1>
        <span className="text-sm text-muted-foreground">— {description}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {subModules.map((sub) => (
          <Link
            key={sub.path}
            href={sub.path}
            className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <sub.icon className="size-4 text-muted-foreground" />
            <span>{sub.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
