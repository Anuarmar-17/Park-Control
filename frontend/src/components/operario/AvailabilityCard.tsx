import React from "react";
import type { AvailabilityInfo } from "@/types/parking";

interface AvailabilityCardProps {
  type:    "cars" | "motos";
  label:   string;
  total:   number;
  info:    AvailabilityInfo;
}

const statusMap: Record<AvailabilityInfo["status"], { label: string; cls: string }> = {
  ok:   { label: "Disponible", cls: "ok" },
  warn: { label: "Casi lleno", cls: "warn" },
  full: { label: "Lleno",      cls: "full" },
};

export function AvailabilityCard({ type, label, total, info }: AvailabilityCardProps) {
  const status = statusMap[info.status];

  return (
    <div className={`avail-card ${type}`}>
      <div className="avail-head">
        <div className="avail-type">
          <div className="avail-type-dot"></div> {label}
        </div>
        <div className={`avail-badge ${status.cls}`}>{status.label}</div>
      </div>
      
      <div className="avail-numbers">
        <div className="avail-free">{info.free}</div>
        <div className="avail-of">/ {total} espacios</div>
      </div>
      
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${info.pct}%` }}></div>
      </div>
      
      <div className="avail-meta">
        <span>{info.occupied} ocupados</span>
        <span>{info.pct}% libre</span>
      </div>
    </div>
  );
}
