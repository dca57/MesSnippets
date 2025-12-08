import React from "react";
import { cx } from "../helpers/classnames";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-slate-400 dark:text-slate-600">{icon}</div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
