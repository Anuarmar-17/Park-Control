import React from "react";
import type { BillingResult, Vehicle } from "@/types/parking";

interface CobroCardProps {
  vehicle: Vehicle;
  billing: BillingResult;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmtT = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtD = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export function CobroCard({ vehicle, billing }: CobroCardProps) {
  const ahora = new Date();
  const rows: [string, string][] = [
    ["Placa",            vehicle.placa],
    ["Tipo",             vehicle.tipo],
    ["Espacio",          vehicle.slotId],
    ["Hora de entrada",  `${fmtD(vehicle.entrada)} ${fmtT(vehicle.entrada)}`],
    ["Hora de salida",   `${fmtD(ahora)} ${fmtT(ahora)}`],
    ["Tiempo transcurrido", `${billing.horas}h ${billing.mins % 60}min (${billing.mins} min total)`],
    ["Tarifa aplicada",  `$${billing.tarifa.toLocaleString("es-CO")} / fracción`],
  ];

  return (
    <div id="cobro-card" className="visible" style={{ display: 'block' }}>
      <div className="cobro-title">Resumen de Cobro</div>

      {rows.map(([key, val]) => (
        <div key={key} className="cobro-row">
          <span className="cobro-key">{key}</span>
          <span className="cobro-val">{val}</span>
        </div>
      ))}

      <div className="cobro-total-row">
        <span className="cobro-total-label">Total a Pagar</span>
        <span className="cobro-total-val">${billing.total.toLocaleString("es-CO")}</span>
      </div>
    </div>
  );
}
