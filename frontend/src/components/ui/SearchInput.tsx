import React from "react";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  wrapClassName?: string;
}

/** Campo de búsqueda con ícono 🔍 prefijado. */
export function SearchInput({ wrapClassName, ...props }: SearchInputProps) {
  return (
    <div className={`relative ${wrapClassName ?? ""}`}>
      <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--muted-2)] text-[0.9rem] pointer-events-none">
        🔍
      </span>
      <input
        {...props}
        className="pl-8 pr-3 py-[9px] rounded-[var(--radius)] border-[1.5px] border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-[0.9rem] outline-none transition-[border-color,box-shadow] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(21,112,239,.12)] placeholder:text-[var(--muted-2)] w-full"
      />
    </div>
  );
}
