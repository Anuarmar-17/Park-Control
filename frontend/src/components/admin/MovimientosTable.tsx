"use client";

import React, { useState } from "react";
import type { Movimiento } from "@/types/parking";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtT = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

interface MovimientosTableProps {
  movimientos: Movimiento[];
}

const TIPO_BADGE: Record<string, string> = {
  Sedán:     "chip chip-blue",
  Camioneta: "chip chip-amber",
  Moto:      "chip chip-green",
};

export function MovimientosTable({ movimientos }: MovimientosTableProps) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? movimientos.filter((m) => m.placa.includes(search.toUpperCase()))
    : movimientos;

  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>🔄 Últimos Movimientos Finalizados</h3>
          <p>Registros de salida completados hoy</p>
        </div>
        <div className="table-actions">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input 
              className="form-input" 
              placeholder="Buscar placa..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ paddingLeft: "34px", width: "200px" }} 
            />
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: "auto" }}>⬇ Exportar</button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Duración</th>
              <th>Tarifa</th>
              <th>Total</th>
              <th>Operario</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-state">Sin resultados</td></tr>
            ) : filtered.map((m) => (
              <tr key={m.id}>
                <td><span className="plate-tag">{m.placa}</span></td>
                <td><span className={TIPO_BADGE[m.tipo] || "chip chip-gray"}>{m.tipo}</span></td>
                <td className="time-pill">{fmtT(m.entrada)}</td>
                <td className="time-pill">{fmtT(m.salida)}</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: ".8rem" }}>{m.duracion}</td>
                <td style={{ fontFamily: "'DM Mono', monospace" }}>${m.tarifa.toLocaleString("es-CO")}</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "var(--success)" }}>${m.total.toLocaleString("es-CO")}</td>
                <td style={{ color: "var(--muted)", fontSize: ".82rem" }}>{m.operario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
