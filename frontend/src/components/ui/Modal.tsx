"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { Button } from "./Button";

export type ModalIconColor = "blue" | "green" | "amber" | "red";

interface ModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  icon?:    string;
  iconColor?: ModalIconColor;
  title:    string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?:   React.ReactNode;
  maxWidth?: string;
}

const iconBgMap: Record<ModalIconColor, string> = {
  blue:  "bg-[var(--accent-soft)]",
  green: "bg-[var(--success-soft)]",
  amber: "bg-[var(--amber-soft)]",
  red:   "bg-[var(--danger-soft)]",
};

/** Modal con backdrop blur, animación de entrada y cierre con Esc/click fuera. */
export function Modal({
  isOpen,
  onClose,
  icon,
  iconColor = "blue",
  title,
  subtitle,
  children,
  footer,
  maxWidth = "min(520px,100%)",
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(16,24,40,.5)] backdrop-blur-[4px] grid place-items-center z-[200] p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-7 shadow-[var(--shadow-lg)] max-h-[90vh] overflow-y-auto animate-[modalIn_.22s_cubic-bezier(.34,1.56,.64,1)]"
        style={{ width: maxWidth }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={clsx(
                  "w-11 h-11 rounded-[10px] grid place-items-center text-[1.3rem] shrink-0",
                  iconBgMap[iconColor]
                )}
              >
                {icon}
              </div>
            )}
            <div>
              <div className="text-[1.05rem] font-bold text-[var(--text)]">{title}</div>
              {subtitle && (
                <div className="text-[0.82rem] text-[var(--muted)] mt-[2px]">{subtitle}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[6px] bg-none border border-[var(--border)] text-[var(--muted)] grid place-items-center text-[0.9rem] shrink-0 transition-all hover:border-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {children}

        {/* Footer */}
        {footer && (
          <div className="flex gap-[10px] justify-end mt-6 pt-5 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Footer helper: botones Cancelar + Confirmar */
export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel  = "Confirmar",
  cancelLabel   = "Cancelar",
  confirmVariant = "primary" as const,
}: {
  onCancel:       () => void;
  onConfirm?:     () => void;
  confirmLabel?:  string;
  cancelLabel?:   string;
  confirmVariant?: "primary" | "success" | "danger";
}) {
  return (
    <>
      <Button variant="secondary" size="sm" onClick={onCancel}>
        {cancelLabel}
      </Button>
      {onConfirm && (
        <Button variant={confirmVariant} size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      )}
    </>
  );
}
