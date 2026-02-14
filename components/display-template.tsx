interface DisplayTemplateProps {
  readonly title: string;
  readonly description?: string;
  readonly toolbar?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
}

export default function DisplayTemplate({
  title,
  description,
  toolbar,
  actions,
  children,
}: DisplayTemplateProps) {
  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {(toolbar || actions) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">{toolbar}</div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}

      {children}
    </div>
  );
}
