"use client";

import React, { useState, useEffect } from "react";
import { useParkingContext } from "@/context/ParkingContext";
import { useToast } from "@/components/ui/Toast";

import type { VehicleType } from "@/types/parking";

interface EntradaFormProps {
  onSuccess: (placa: string, slotId: string, ticketCode: string, tipo: VehicleType) => void;
}

// Mapa de tipo de vehículo a tipo_vehiculo_id en la BD
const TIPO_ID_MAP: Record<string, number> = {
  "Sedán":     1,
  "Camioneta": 2,
  "Moto":      3,
};

export function EntradaForm({ onSuccess }: EntradaFormProps) {
  const { disponibilidad, registrarEntradaAPI, isLoading: ctxLoading } = useParkingContext();
  const { showToast } = useToast();

  const [placa,     setPlaca]     = useState("");
  const [tipo,      setTipo]      = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calcular cupos disponibles para mostrar en el select
  const cuposDisp = tipo === "Moto"
    ? disponibilidad?.motos.libres ?? 0
    : disponibilidad?.cars.libres ?? 0;

  const handleSubmit = async () => {
    const p = placa.trim().toUpperCase();
    if (p.length < 5) return showToast("Ingresa una placa válida (mínimo 5 caracteres)", "error");
    if (!tipo)        return showToast("Selecciona el tipo de vehículo", "error");
    if (cuposDisp === 0) return showToast("No hay cupos disponibles para este tipo de vehículo", "error");

    const tipo_vehiculo_id = TIPO_ID_MAP[tipo];
    setIsLoading(true);
    try {
      const { espacio, codigo_ticket } = await registrarEntradaAPI(p, tipo_vehiculo_id);
      setPlaca(""); setTipo("");
      showToast(`Entrada registrada — Espacio ${espacio}`, "success");
      onSuccess(p, espacio, codigo_ticket, tipo as any);
    } catch (err: any) {
      showToast(err.message || "Error al registrar la entrada", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || ctxLoading;

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div className="form-card-title">
          Registrar Entrada
          <span className="form-tag green">Entrada</span>
        </div>
        <p className="form-card-sub">Ingresa los datos del vehículo para registrar su ingreso.</p>
      </div>

      <div className="field">
        <label>Placa del vehículo</label>
        <input
          type="text"
          maxLength={8}
          placeholder="EJ. ABC-123"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          disabled={loading}
        />
      </div>

      <div className="field">
        <label>Tipo de vehículo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={loading}>
          <option value="">— Seleccionar tipo —</option>
          <option value="Sedán">
            Sedán {disponibilidad ? `(${disponibilidad.cars.libres} cupos libres)` : ""}
          </option>
          <option value="Camioneta">
            Camioneta {disponibilidad ? `(${disponibilidad.cars.libres} cupos libres)` : ""}
          </option>
          <option value="Moto">
            Motocicleta {disponibilidad ? `(${disponibilidad.motos.libres} cupos libres)` : ""}
          </option>
        </select>
      </div>

      {tipo && (
        <div className="field" style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "0.78rem", color: cuposDisp > 0 ? "var(--success)" : "var(--danger)", margin: 0 }}>
            {cuposDisp > 0
              ? `✅ ${cuposDisp} cupos disponibles para ${tipo}`
              : `❌ Sin cupos disponibles para ${tipo}`}
          </p>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || cuposDisp === 0}
      >
        {loading ? "⏳ Registrando..." : "📥 Registrar Entrada"}
      </button>
    </div>
  );
}
