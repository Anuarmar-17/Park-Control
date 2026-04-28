import React from "react";
import type { Tarifa } from "@/types/parking";

const ICONS: Record<string, string> = { 
  "sedán": "🚗", 
  "sedan": "🚗", 
  "camioneta": "🚙", 
  "moto": "🏍️" 
};

interface TarifaCardProps {
  tarifa:   Tarifa;
  onEdit:   (tarifa: Tarifa) => void;
}

export function TarifaCard({ tarifa, onEdit }: TarifaCardProps) {
  const tipoKey = tarifa.tipo.toLowerCase();
  return (
    <div className="tarifa-card">
      <div className="tarifa-icon">{ICONS[tipoKey] ?? "🚗"}</div>
      <div className="tarifa-name">{tarifa.tipo}</div>
      <div className="tarifa-meta">Cobro por {tarifa.cobro}</div>
      <div className="tarifa-price">
        ${tarifa.valor.toLocaleString("es-CO")} <span className="tarifa-price-unit">/ {tarifa.cobro}</span>
      </div>
      <div className="tarifa-actions">
        <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => onEdit(tarifa)}>✏️ Editar</button>
      </div>
    </div>
  );
}
