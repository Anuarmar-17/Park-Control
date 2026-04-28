import React from "react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  fullWidth?: boolean;
  children:  React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[0_1px_3px_rgba(21,112,239,.3)] hover:bg-[var(--accent-dark)] hover:shadow-[0_4px_12px_rgba(21,112,239,.35)]",
  secondary:
    "bg-[var(--surface)] text-[var(--text-2)] border border-[var(--border)] hover:border-[var(--border-2)] hover:bg-[var(--bg)]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#9a1e16]",
  success:
    "bg-[var(--success)] text-white hover:bg-[#047148]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-[6px] text-[0.8rem]",
  md: "px-4 py-[8px] text-[0.855rem]",
  lg: "px-4 py-[10px] text-[0.875rem]",
};

/** Botón reutilizable con variantes primary / secondary / danger / success. */
export function Button({
  variant  = "primary",
  size     = "md",
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-[7px] rounded-[var(--radius)] font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
