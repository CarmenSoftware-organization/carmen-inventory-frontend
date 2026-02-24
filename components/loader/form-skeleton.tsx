import { Skeleton } from "@/components/ui/skeleton";

function ToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <ToolbarSkeleton />
      <div className="max-w-2xl flex flex-col gap-3">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
    </div>
  );
}
