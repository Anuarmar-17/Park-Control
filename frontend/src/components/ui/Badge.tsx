import React from "react";
import { clsx } from "clsx";

export type BadgeVariant = "blue" | "green" | "amber" | "red" | "gray" | "purple";
export type BadgeSize    = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?:    BadgeSize;
  dot?:     boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue:   "bg-[var(--accent-soft)]   text-[var(--accent)]   border-[#c5d9fc]",
  green:  "bg-[var(--success-soft)]  text-[var(--success)]  border-transparent",
  amber:  "bg-[var(--amber-soft)]    text-[var(--amber)]    border-transparent",
  red:    "bg-[var(--danger-soft)]   text-[var(--danger)]   border-transparent",
  gray:   "bg-[var(--bg)]            text-[var(--muted)]    border-[var(--border)]",
  purple: "bg-purple-50              text-purple-600         border-transparent",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[0.68rem] px-[7px] py-[2px]",
  md: "text-[0.73rem] px-[9px] py-[3px]",
};

/** Chip / Badge de estado con variantes de color. */
export function Badge({
  variant = "gray",
  size = "md",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className="w-[6px] h-[6px] rounded-full bg-current" />}
      {children}
    </span>
  );
}
