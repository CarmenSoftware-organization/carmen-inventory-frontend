import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { Folder, type LucideIcon } from "lucide-react";

interface EmptyComponentProps {
  readonly icon?: LucideIcon;
  readonly title?: string;
  readonly description?: React.ReactNode;
  readonly content?: React.ReactNode;
  readonly classNames?: string;
}

export default function EmptyComponent({
  icon: Icon = Folder,
  title = "No data",
  description = "No data found",
  content,
  classNames,
}: EmptyComponentProps) {
  return (
    <Empty className={classNames}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {content && (
        <EmptyContent className="flex-row justify-center gap-2">
          {content}
        </EmptyContent>
      )}
    </Empty>
  );
}
