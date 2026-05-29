import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function ErrorState({ title, description, action, className = "" }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-card px-6 py-10 text-center shadow-sm ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-destructive">{title}</h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default ErrorState;
