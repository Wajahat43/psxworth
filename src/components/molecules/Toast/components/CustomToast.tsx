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
    bgGradient,
    borderColor,
    shadowColor,
    iconGradient,
    textColor,
    progressGradient,
    animate,
  } = config;

  return (
    <div
      className={cn(
        "bg-slate-800/95 backdrop-blur-sm border rounded-xl p-2 shadow-2xl min-w-[320px] max-w-md",
        borderColor,
        shadowColor
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center", bgGradient, {
            "animate-pulse": animate,
          })}
        >
          <Icon className={cn("w-5 h-5", iconGradient)} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
          <div className={cn("font-semibold text-sm", textColor)}>{title}</div>
          {description && <div className="text-slate-300 text-xs leading-relaxed mt-1">{description}</div>}
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
      <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", progressGradient, {
            "animate-pulse": animate,
          })}
        ></div>
      </div>
    </div>
  );
};
