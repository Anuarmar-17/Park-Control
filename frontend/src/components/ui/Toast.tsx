"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning";

interface ToastMessage {
  id:      number;
  msg:     string;
  type:    ToastType;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (msg: string, type: ToastType = "success") => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev.slice(-2), { id, msg, type }]);
      const timer = setTimeout(() => dismiss(id), 3_400);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const bgMap: Record<ToastType, string> = {
    success: "bg-[var(--success)]",
    error:   "bg-[var(--danger)]",
    warning: "bg-[var(--amber)]",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-[9px] px-5 py-[11px] rounded-[var(--radius)] text-white text-[0.875rem] font-medium shadow-[var(--shadow-lg)] min-w-[240px] max-w-[400px] animate-[fadeUp_.3s_ease] ${bgMap[t.type]}`}
          >
            {t.type === "success" && "✅ "}
            {t.type === "error"   && "❌ "}
            {t.type === "warning" && "⚠️ "}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
