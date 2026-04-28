"use client";

import React from "react";
import type { Tarifa } from "@/types/parking";

const ICONS: Record<string, string> = { Sedán: "🚗", Camioneta: "🚙", Moto: "🏍️" };

interface TarifasTableProps {
  tarifas:  Tarifa[];
  onEdit:   (t: Tarifa) => void;
  onDelete: (t: Tarifa) => void;
}

export function TarifasTable({ tarifas, onEdit, onDelete }: TarifasTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>📋 Tarifas Registradas</h3>
          <p>Historial de todas las configuraciones</p>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo Vehículo</th>
              <th>Modalidad</th>
              <th>Valor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tarifas.map((t) => (
              <tr key={t.id}>
                <td>{ICONS[t.tipo] || "🚗"} {t.tipo}</td>
                <td><span className="chip chip-gray">Por {t.cobro}</span></td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                  ${t.valor.toLocaleString("es-CO")}
                </td>
                <td>
                  {t.activo 
                    ? <span className="chip chip-green">● Activa</span>
                    : <span className="chip chip-gray">○ Inactiva</span>
                  }
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn-row" onClick={() => onEdit(t)}>Editar</button>
                    <button className="btn-row danger" onClick={() => onDelete(t)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
