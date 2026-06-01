"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import { CustomToast as CustomToastComponent } from "./components/CustomToast";
import { toastConfig } from "./toast.config";
import { ToastProps } from "./types";

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom every time. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom(
    (id) => (
      <CustomToast
        id={id}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        button={{
          label: toast.button?.label,
        }}
      />
    ),
    {
      style: {
        borderRadius: "0.75rem", // rounded-xl (to round the border, because originally it is not.)
      },
      duration: toast.duration ?? 2000,
    }
  );
}

const CustomToast = (props: ToastProps) => {
  const { type, title, description, id } = props;
  const config = toastConfig[type || "default"];
  return <CustomToastComponent id={id} title={title} description={description} config={config} type={type} />;
};

export default CustomToast;
