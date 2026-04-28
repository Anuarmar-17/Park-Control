import React from "react";

interface PageHeaderProps {
  title:    string;
  subtitle?: string;
  actions?:  React.ReactNode;
}

/** Cabecera de sección con H1, subtítulo y slot para acciones a la derecha. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[1.375rem] font-bold tracking-[-0.02em] text-[var(--text)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[0.875rem] text-[var(--muted)] mt-[2px]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
