import React from "react";
import { Icons } from "../icons";

export interface SelectOption {
  value: string;
  label: string;
  className?: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  optGroups?: { label: string; options: SelectOption[] }[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  optGroups,
  className = "",
  placeholder,
  disabled,
}) => (
  <div className={`relative ${className}`}>
    <select
      disabled={disabled}
      value={value}
      onChange={onChange}
      className={`w-full appearance-none bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded px-2 py-1.5 pr-6 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${
        value === "" && placeholder ? "text-slate-500" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {placeholder && (
        <option value="" className="text-slate-500">
          {placeholder}
        </option>
      )}
      {options &&
        options.map((opt) => (
          <option key={opt.value} value={opt.value} className={opt.className}>
            {opt.label}
          </option>
        ))}
      {optGroups &&
        optGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className={opt.className}
              >
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
    </select>
    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 scale-75">
      <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
    </div>
  </div>
);
