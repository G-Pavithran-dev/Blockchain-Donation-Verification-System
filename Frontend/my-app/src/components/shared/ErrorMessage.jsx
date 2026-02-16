import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ title = 'Error', message, retry }) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
