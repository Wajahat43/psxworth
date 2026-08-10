import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ToastProps, ToastConfig } from "../types";

interface CustomToastProps extends ToastProps {
  config: ToastConfig;
}

export const CustomToast = (props: CustomToastProps) => {
  const { id, title, description, config } = props;
  const {
    icon: Icon,
    rootClassName,
    iconWrapperClassName,
    iconClassName,
    titleClassName,
    descriptionClassName,
  } = config;

  return (
    <div
      className={cn(
        "min-w-0 w-full max-w-md rounded-2xl border px-4 py-3 backdrop-blur-xl sm:min-w-[320px]",
        rootClassName
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
            iconWrapperClassName
          )}
        >
          <Icon className={cn("h-5 w-5", iconClassName)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center pt-0.5">
          <div className={cn("text-sm font-medium leading-5", titleClassName)}>{title}</div>
          {description && <div className={cn("mt-1 text-sm leading-5", descriptionClassName)}>{description}</div>}
        </div>
        <button
          onClick={() => toast.dismiss(id)}
          type="button"
          aria-label="Dismiss notification"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
