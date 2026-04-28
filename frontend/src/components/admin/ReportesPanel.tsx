"use client";

import React, { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboardService";

export function ReportesPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await dashboardService.getReportesMensuales();
        setData(res);
      } catch (err) {
        console.error("Error al cargar datos de reportes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fmtMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${val.toLocaleString("es-CO")}`;
  };

  const getDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const deltaIngresos = data ? getDelta(data.ingresos_mes, data.ingresos_anterior) : 0;
  const deltaVehiculos = data ? getDelta(data.vehiculos_mes, data.vehiculos_anterior) : 0;

  return (
    <>
      <div className="alert alert-info" style={{ marginBottom: "24px", background: "var(--accent-soft)", padding: "16px", borderRadius: "var(--radius)", color: "var(--accent)", border: "1px solid #c5d9fc" }}>
        📊 Resumen de desempeño del mes actual. Puedes exportar el historial completo a continuación.
      </div>
      
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-label">Ingresos del Mes <span className="kpi-icon">📅</span></div>
          <div className="kpi-val">{loading ? "..." : fmtMoney(data?.ingresos_mes || 0)}</div>
          <div className="kpi-sub">
            <span className={`kpi-delta ${deltaIngresos >= 0 ? "up" : "down"}`}>
              {deltaIngresos >= 0 ? "▲" : "▼"} {Math.abs(Math.round(deltaIngresos))}%
            </span> vs mes anterior
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Vehículos / Mes <span className="kpi-icon">🚙</span></div>
          <div className="kpi-val">{loading ? "..." : (data?.vehiculos_mes || 0).toLocaleString()}</div>
          <div className="kpi-sub">
            <span className={`kpi-delta ${deltaVehiculos >= 0 ? "up" : "down"}`}>
              {deltaVehiculos >= 0 ? "▲" : "▼"} {Math.abs(Math.round(deltaVehiculos))}%
            </span> vs mes anterior
          </div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Días Operativos <span className="kpi-icon">📆</span></div>
          <div className="kpi-val">{loading ? "..." : (data?.dias_operativos || 0)}</div>
          <div className="kpi-sub">Mes actual</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Tasa Ocupación <span className="kpi-icon">📈</span></div>
          <div className="kpi-val">{loading ? "..." : `${Math.round(data?.tasa_ocupacion || 0)}%`}</div>
          <div className="kpi-sub">Promedio actual</div>
        </div>
      </div>
      
      <div className="section-card">
        <h3>⬇ Exportar Reporte</h3>
        <p>Genera un informe del período seleccionado.</p>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Fecha Inicio</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Fin</label>
            <input type="date" className="form-input" />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" style={{ width: "auto" }}>📄 Generar PDF</button>
          <button className="btn btn-secondary" style={{ width: "auto" }}>📊 Exportar Excel</button>
        </div>
      </div>
    </>
  );
}
