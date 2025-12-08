import React from "react";
import { Icons } from "@/core/helpers/icons";
import { cx } from "@/core/helpers/classnames";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  className = "",
  message,
}) => {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-2", className)}>
      <Icons.Loader2 size={size} className="animate-spin text-blue-500" />
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  );
};
