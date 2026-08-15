
"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function AdminCheckbox({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
}: AdminCheckboxProps) {
  return (
    <div
      className={`admin-checkbox-container flex items-center gap-3 cursor-pointer ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <Checkbox
        name={name}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        disabled={disabled}
      />
      <span className="text-sm font-medium text-gray-700 select-none">
        {label}
      </span>
    </div>
  );
}
