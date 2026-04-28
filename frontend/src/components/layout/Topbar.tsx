"use client";

import React from "react";
import { useClock } from "@/hooks/useClock";

interface TopbarProps {
  title:        string;
  subtitle:     string;
  onMenuToggle: () => void;
  actions?:     React.ReactNode;
}

export function Topbar({ title, subtitle, onMenuToggle, actions }: TopbarProps) {
  const clock = useClock();

  return (
    <header className="topbar">
      <button
        className="menu-toggle"
        onClick={onMenuToggle}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>

      <div className="topbar-right">
        {actions}
        <div style={{
          fontSize: ".78rem",
          color: "var(--muted)",
          fontFamily: "var(--font-dm-mono), monospace",
          tabularNums: "normal",
        } as React.CSSProperties}>
          {clock}
        </div>
      </div>
    </header>
  );
}
