"use client";

import React, { useState, useCallback } from "react";
import { CobroCard } from "./CobroCard";
import { useParkingContext } from "@/context/ParkingContext";
import { useToast } from "@/components/ui/Toast";
import type { Vehicle, ExitRecord, BillingResult } from "@/types/parking";

interface SalidaFormProps {
  onSuccess: (record: ExitRecord) => void;
}

export function SalidaForm({ onSuccess }: SalidaFormProps) {
  const { buscarVehiculo, calcBilling, registrarSalidaAPI } = useParkingContext();
  const { showToast } = useToast();

  const [searchPlaca, setSearchPlaca] = useState("");
  const [found,       setFound]       = useState<Vehicle | null>(null);
  const [billing,     setBilling]     = useState<BillingResult | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const handleSearch = useCallback(() => {
    const p = searchPlaca.trim().toUpperCase();
    if (!p) return showToast("Ingresa una placa para buscar", "error");
    const v = buscarVehiculo(p);
    if (!v) {
      setFound(null); setBilling(null);
      return showToast("Placa no encontrada en el parqueadero", "error");
    }
    setFound(v);
    setBilling(calcBilling(v));
    showToast(`Vehículo encontrado — Espacio ${v.slotId}`, "success");
  }, [searchPlaca, buscarVehiculo, calcBilling, showToast]);

  const handleConfirm = useCallback(async () => {
    if (!found) return;
    setIsLoading(true);
    try {
      const record = await registrarSalidaAPI(found.placa);
      setSearchPlaca(""); setFound(null); setBilling(null);
      onSuccess(record);
    } catch (err: any) {
      showToast(err.message || "Error al registrar la salida", "error");
    } finally {
      setIsLoading(false);
    }
  }, [found, registrarSalidaAPI, onSuccess, showToast]);

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div className="form-card-title">
          Registrar Salida
          <span className="form-tag blue">Salida</span>
        </div>
        <p className="form-card-sub">Busca la placa del vehículo para calcular el cobro.</p>
      </div>

      <div className="field">
        <label>Buscar por Placa</label>
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Ej. ABC-123"
            maxLength={8}
            value={searchPlaca}
            onChange={(e) => setSearchPlaca(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isLoading}
          />
          <button className="search-btn" onClick={handleSearch} disabled={isLoading}>↵</button>
        </div>
      </div>

      {found && billing && <CobroCard vehicle={found} billing={billing} />}

      <button
        className="btn-primary"
        disabled={!found || isLoading}
        onClick={handleConfirm}
        style={{ marginTop: found ? "0" : "20px" }}
      >
        {isLoading ? "⏳ Procesando..." : "🎫 Confirmar Salida y Generar Ticket"}
      </button>
    </div>
  );
}
