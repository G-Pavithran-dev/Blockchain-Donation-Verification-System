export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="pt-4">{action}</div>}
      </div>
    </div>
  );
}
