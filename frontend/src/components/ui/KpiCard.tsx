import React from "react";

interface KpiCardProps {
  label:   string;
  value:   string;
  diff?:   string;
  icon?:   string;
  subtext?: string;
  color?:  "green" | "blue" | "amber" | "purple";
}

export function KpiCard({ label, value, diff, icon, subtext, color = "blue" }: KpiCardProps) {
  const isPos = diff?.startsWith("+") || diff?.startsWith("▲");
  const isNeg = diff?.startsWith("-") || diff?.startsWith("▼");

  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-label">
        {label}
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-sub">
        {diff && (
          <span className={`kpi-delta ${isPos ? "up" : isNeg ? "down" : ""}`}>
            {isPos && !diff.includes("▲") ? `▲ ${diff}` : isNeg && !diff.includes("▼") ? `▼ ${diff}` : diff}
          </span>
        )}
        {diff && subtext ? " " : ""}
        {subtext}
      </div>
    </div>
  );
}
