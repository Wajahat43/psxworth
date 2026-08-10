export type ToastType = "default" | "success" | "error" | "info" | "warning" | "loading";

export interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  button?: {
    label?: string;
    onClick?: () => void;
  };
}

export interface ToastConfig {
  icon: React.ComponentType<{ className?: string }>;
  rootClassName: string;
  iconWrapperClassName: string;
  iconClassName: string;
  titleClassName: string;
  descriptionClassName: string;
}
