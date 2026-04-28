"use client";

import React, { useState, useEffect } from "react";
import { useParkingContext } from "@/context/ParkingContext";
import type { VehiculoEnCurso } from "@/types/parking";

const pad = (n: number) => String(n).padStart(2, "0");

function fmtFecha(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function elapsedText(isoEntrada: string, now: Date): string {
  const mins = Math.floor((now.getTime() - new Date(isoEntrada).getTime()) / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}min`;
}

const TYPE_BADGE: Record<string, string> = {
  "sedán":    "sedan",
  "sedan":    "sedan",
  "camioneta":"camioneta",
  "moto":     "moto",
};

function VehicleRow({ v, now }: { v: VehiculoEnCurso; now: Date }) {
  const tipoKey = v.tipo.toLowerCase();
  return (
    <tr>
      <td><span className="plate-chip">{v.placa}</span></td>
      <td>
        <span className={`type-chip ${TYPE_BADGE[tipoKey] ?? ""}`}>{v.tipo}</span>
      </td>
      <td><span className="slot-chip">{v.espacio}</span></td>
      <td>{fmtFecha(v.fecha_hora_entrada)}</td>
      <td suppressHydrationWarning>{elapsedText(v.fecha_hora_entrada, now)}</td>
      <td style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{v.registrado_por}</td>
    </tr>
  );
}

export function VehicleTable() {
  const { vehiculosEnCurso, isLoading, errorMsg } = useParkingContext();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && vehiculosEnCurso.length === 0) {
    return (
      <div id="vehicle-list">
        <div className="list-header">
          <span className="list-header-title">Vehículos en Parqueadero</span>
          <span className="list-count">Cargando…</span>
        </div>
        <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
          ⏳ Cargando datos en tiempo real…
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div id="vehicle-list">
        <div className="list-header">
          <span className="list-header-title">Vehículos en Parqueadero</span>
        </div>
        <div className="alert alert-danger" style={{ margin: "16px" }}>
          ⚠️ {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div id="vehicle-list">
      <div className="list-header">
        <span className="list-header-title">Vehículos en Parqueadero</span>
        <span className="list-count">{vehiculosEnCurso.length} activos</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>PLACA</th>
              <th>TIPO</th>
              <th>ESPACIO</th>
              <th>ENTRADA</th>
              <th>TIEMPO</th>
              <th>OPERARIO</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosEnCurso.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">Sin vehículos registrados aún</td>
              </tr>
            ) : (
              vehiculosEnCurso.map((v) => (
                <VehicleRow key={v.id} v={v} now={now} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}