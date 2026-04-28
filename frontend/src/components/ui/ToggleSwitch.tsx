"use client";

import React from "react";

interface ToggleSwitchProps {
  id:       string;
  checked:  boolean;
  onChange: (checked: boolean) => void;
  label?:   string;
}

/** Switch estilizado sobre un checkbox nativo. */
export function ToggleSwitch({ id, checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="relative w-10 h-[22px] shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <label
          htmlFor={id}
          className="block w-full h-full bg-[var(--border-2)] rounded-full cursor-pointer transition-colors peer-checked:bg-[var(--success)] after:content-[''] after:absolute after:w-4 after:h-4 after:rounded-full after:bg-white after:top-[3px] after:left-[3px] after:shadow-[0_1px_3px_rgba(0,0,0,.2)] after:transition-transform peer-checked:after:translate-x-[18px]"
        />
      </div>
      {label && (
        <label
          htmlFor={id}
          className="text-[0.875rem] font-medium text-[var(--text-2)] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
