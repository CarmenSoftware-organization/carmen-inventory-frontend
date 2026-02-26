import { cn } from "@/lib/utils";

interface CellActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: React.ReactNode;
}

export function CellAction({ className, children, ...props }: CellActionProps) {
  return (
    <button
      type="button"
      className={cn("font-medium hover:underline text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:rounded-sm", className)}
      {...props}
    >
      {children}
    </button>
  );
}
