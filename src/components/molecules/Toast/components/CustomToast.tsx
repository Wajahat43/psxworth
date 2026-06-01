import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          aria-label="Dismiss toast"
          onClick={() => toast.dismiss(id)}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-100/70 flex items-center justify-center p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
