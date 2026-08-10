import { AlertCircle, AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react";
import { ToastConfig, ToastType } from "./types";

const sharedToastClasses = {
  rootClassName: "border-white/10 bg-zinc-950/92 shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
  titleClassName: "text-white/95",
  descriptionClassName: "text-white/60",
} satisfies Pick<ToastConfig, "rootClassName" | "titleClassName" | "descriptionClassName">;

export const toastConfig: Record<ToastType, ToastConfig> = {
  default: {
    ...sharedToastClasses,
    icon: Info,
    iconWrapperClassName: "bg-white/5 ring-1 ring-inset ring-white/10",
    iconClassName: "text-white/70",
  },
  success: {
    ...sharedToastClasses,
    icon: CheckCircle,
    iconWrapperClassName: "bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/20",
    iconClassName: "text-emerald-300",
  },
  error: {
    ...sharedToastClasses,
    icon: AlertCircle,
    iconWrapperClassName: "bg-rose-500/10 ring-1 ring-inset ring-rose-400/20",
    iconClassName: "text-rose-300",
  },
  info: {
    ...sharedToastClasses,
    icon: Info,
    iconWrapperClassName: "bg-sky-500/10 ring-1 ring-inset ring-sky-400/20",
    iconClassName: "text-sky-300",
  },
  warning: {
    ...sharedToastClasses,
    icon: AlertTriangle,
    iconWrapperClassName: "bg-amber-500/10 ring-1 ring-inset ring-amber-400/20",
    iconClassName: "text-amber-300",
  },
  loading: {
    ...sharedToastClasses,
    icon: Sparkles,
    iconWrapperClassName: "bg-amber-500/10 ring-1 ring-inset ring-amber-400/20",
    iconClassName: "text-amber-300",
  },
};
