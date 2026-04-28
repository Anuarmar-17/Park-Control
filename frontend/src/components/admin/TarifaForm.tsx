"use client";

import React, { useState, useEffect } from "react";
import type { Tarifa, VehicleType, CobroType } from "@/types/parking";

interface TarifaFormProps {
  editing:  Tarifa | null;
  onSave:   (data: Omit<Tarifa, "id">) => void;
  onCancel: () => void;
}

export function TarifaForm({ editing, onSave, onCancel }: TarifaFormProps) {
  const [tipo,   setTipo]   = useState<VehicleType | "">("");
  const [cobro,  setCobro]  = useState<CobroType>("Hora");
  const [valor,  setValor]  = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (editing) {
      setTipo(editing.tipo); setCobro(editing.cobro);
      setValor(String(editing.valor)); setActivo(editing.activo);
    } else {
      setTipo(""); setCobro("Hora"); setValor(""); setActivo(true);
    }
  }, [editing]);

  const handleSave = () => {
    if (!tipo)               return alert("Selecciona el tipo de vehículo.");
    const v = parseInt(valor);
    if (!v || v < 1)         return alert("Ingresa un valor válido.");
    onSave({ tipo: tipo as VehicleType, cobro, valor: v, activo });
  };

  return (
    <div className="section-card">
      <h3>{editing ? `✏️ Editando Tarifa — ${editing.tipo}` : "➕ Crear / Editar Tarifa"}</h3>
      <p>Completa los campos para guardar la configuración de una tarifa.</p>

      <div className="form-grid cols-3">
        <div className="form-group">
          <label className="form-label">Tipo de Vehículo</label>
          <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value as VehicleType | "")}>
            <option value="">— Seleccionar —</option>
            <option value="Sedán">Sedán</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Moto">Moto</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de Cobro</label>
          <select className="form-select" value={cobro} onChange={(e) => setCobro(e.target.value as CobroType)}>
            <option value="Fracción">Por Fracción</option>
            <option value="Hora">Por Hora</option>
            <option value="Minuto">Por Minuto</option>
            <option value="Día">Por Día</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Valor ($)</label>
          <input className="form-input" type="number" min="0" placeholder="Ej. 3500" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div className="form-group full">
          <label className="form-label">Estado</label>
          <div className="toggle-wrap">
            <input type="checkbox" className="toggle-input" id="tf-activo" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            <label className="toggle-slider" htmlFor="tf-activo"></label>
            <label className="toggle-label" htmlFor="tf-activo">Tarifa activa</label>
          </div>
        </div>
      </div>

      <div className="divider" style={{ borderTop: "1px solid var(--border)", margin: "20px 0" }}></div>
      <div className="form-actions">
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleSave}>💾 Guardar Tarifa</button>
        <button className="btn btn-secondary" style={{ width: "auto" }} onClick={onCancel}>✕ Cancelar</button>
      </div>
    </div>
  );
}
