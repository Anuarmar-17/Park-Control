import React from "react";
import type { ExitRecord } from "@/types/parking";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtT = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const TYPE_BADGE: Record<string, string> = {
  Sedán:     "bg-[var(--accent-soft)] text-[var(--accent)]",
  Camioneta: "bg-[var(--success-soft)] text-[var(--success)]",
  Moto:      "bg-[var(--amber-soft)] text-[var(--amber)]",
};

interface ExitHistoryTableProps {
  records: ExitRecord[];
}

export function ExitHistoryTable({ records }: ExitHistoryTableProps) {
  return (
    <div id="exit-list">
      <div className="list-header">
        <span className="list-header-title">Historial de Salidas</span>
        <span className="list-count">{records.length} {records.length === 1 ? 'salida' : 'salidas'}</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>PLACA</th>
              <th>TIPO</th>
              <th>ENTRADA</th>
              <th>SALIDA</th>
              <th>TIEMPO</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">Sin salidas registradas aún</td>
              </tr>
            ) : (
              records.map((r, i) => {
                const tiempoStr = r.horas > 0 ? `${r.horas}h ${r.mins % 60}m` : `${r.mins}min`;
                return (
                  <tr key={i}>
                    <td><span className="plate-chip">{r.placa}</span></td>
                    <td><span className={`type-chip ${TYPE_BADGE[r.tipo] ? r.tipo.toLowerCase() : ''}`} style={TYPE_BADGE[r.tipo] ? {} : {background:'var(--bg)', color:'var(--muted)'}}>{r.tipo}</span></td>
                    <td>{fmtT(r.entrada)}</td>
                    <td>{fmtT(r.salida)}</td>
                    <td className="time-col">{tiempoStr}</td>
                    <td className="total-col">${r.total.toLocaleString("es-CO")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
