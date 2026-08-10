import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const gradientButtonVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "p-0.5 mb-2 me-2 overflow-hidden",
    "text-md font-medium text-gray-100/90",
    "rounded-lg group",
    "transition-all ease-in duration-75",
  ],
  {
    variants: {
      variant: {
        purpleBlue: ["bg-gradient-to-br from-purple-600 to-blue-500"],
        cyanBlue: ["bg-gradient-to-br from-cyan-700 to-blue-500"],
        greenBlue: ["bg-gradient-to-br from-green-400 to-blue-600"],
        purplePink: ["bg-gradient-to-br from-purple-500 to-pink-500"],
        pinkOrange: ["bg-gradient-to-br from-pink-500 to-orange-400"],
        tealLime: ["bg-gradient-to-br from-teal-300 to-lime-300"],
        redYellow: ["bg-gradient-to-br from-red-200 via-red-300 to-yellow-200"],
      },
      fullWidth: {
        true: "w-full",
        false: "inline-flex me-2",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "purpleBlue",
      fullWidth: false,
      disabled: false,
    },
    compoundVariants: [
      {
        disabled: false,
        className: "hover:text-gray-100 hover:scale-[1.02]",
      },
      {
        variant: "purpleBlue",
        disabled: false,
        className: "group-hover:from-purple-600 group-hover:to-blue-500 focus:ring-blue-300 dark:focus:ring-blue-800",
      },
      {
        variant: "cyanBlue",
        disabled: false,
        className: "group-hover:from-cyan-500 group-hover:to-blue-500 focus:ring-cyan-200 dark:focus:ring-cyan-800",
      },
      {
        variant: "greenBlue",
        disabled: false,
        className: "group-hover:from-green-400 group-hover:to-blue-600 focus:ring-green-200 dark:focus:ring-green-800",
      },
      {
        variant: "purplePink",
        disabled: false,
        className:
          "group-hover:from-purple-500 group-hover:to-pink-500 focus:ring-purple-200 dark:focus:ring-purple-800",
      },
      {
        variant: "pinkOrange",
        disabled: false,
        className: "group-hover:from-pink-500 group-hover:to-orange-400 focus:ring-pink-200 dark:focus:ring-pink-800",
      },
      {
        variant: "tealLime",
        disabled: false,
        className: "group-hover:from-teal-300 group-hover:to-lime-300 focus:ring-lime-200 dark:focus:ring-lime-800",
      },
      {
        variant: "redYellow",
        disabled: false,
        className:
          "group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 focus:ring-red-100 dark:focus:ring-red-400",
      },
    ],
  }
);

const spanVariants = cva(
  [
    "text-xs md:text-md relative px-2 md:px-4 py-2 md:py-2 flex items-center justify-center",
    "transition-all ease-in duration-75",
    "bg-gray-900 rounded-md",
  ],
  {
    variants: {
      fullWidth: {
        true: "w-full text-center",
        false: "",
      },
      disabled: {
        true: "",
        false: "group-hover:bg-transparent group-hover:dark:bg-transparent",
      },
    },
    defaultVariants: {
      fullWidth: false,
      disabled: false,
    },
  }
);

export interface GradientButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof gradientButtonVariants> {
  children: React.ReactNode;
  as?: React.ElementType;
}

const GradientButton = ({
  children,
  variant,
  fullWidth,
  disabled,
  className,
  onClick,
  as: Component = "button",
  ...props
}: GradientButtonProps) => {
  return (
    <Component
      className={cn(gradientButtonVariants({ variant, fullWidth, disabled }), className)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      <span className={spanVariants({ fullWidth })}>{children}</span>
    </Component>
  );
};

export default GradientButton;
