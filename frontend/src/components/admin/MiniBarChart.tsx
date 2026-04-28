import React from "react";

interface BarItem {
  label: string;
  value: number;
  max:   number;
  color?: string;
  countLabel?: string;
}

interface MiniBarChartProps {
  title:    string;
  subtitle: string;
  items:    BarItem[];
  labelWidth?: string;
}

export function MiniBarChart({ title, subtitle, items, labelWidth = "70px" }: MiniBarChartProps) {
  return (
    <div className="mini-chart-card">
      <h4>{title}</h4>
      <p>{subtitle}</p>
      <div className="bar-track">
        {items.map((item) => (
          <div key={item.label} className="bar-row">
            <span className="bar-label" style={{ width: labelWidth }}>{item.label}</span>
            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.round((item.value / item.max) * 100)}%`,
                  background: item.color ?? "var(--accent)"
                }}
              ></div>
            </div>
            <span className="bar-count">{item.countLabel ?? item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
