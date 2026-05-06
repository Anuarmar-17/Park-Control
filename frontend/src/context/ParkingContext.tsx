"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type {
  Vehicle,
  VehicleType,
  SlotMap,
  ExitRecord,
  BillingResult,
  ParkingRow,
  VehiculoEnCurso,
  DisponibilidadData,
} from "@/types/parking";
import { dashboardService } from "@/services/dashboardService";
import { operacionService } from "@/services/operacionService";

// ─── Constants ────────────────────────────────────────────────────────────────

export const TARIFA: Record<VehicleType, number> = {
  Sedán:     1000,
  Camioneta: 1000,
  Moto:      500,
};

export const CAPACIDAD = { cars: 30, motos: 15 };

export const CAR_ROWS: ParkingRow[] = [
  { label: "A", spots: 10 },
  { label: "B", spots: 10 },
  { label: "C", spots: 10 },
];

export const MOTO_ROWS: ParkingRow[] = [
  { label: "M1", spots: 5 },
  { label: "M2", spots: 5 },
  { label: "M3", spots: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generarSlots(rows: ParkingRow[]): SlotMap {
  const slots: SlotMap = {};
  rows.forEach((row) => {
    for (let i = 1; i <= row.spots; i++) {
      slots[`${row.label}${i}`] = null;
    }
  });
  return slots;
}

function normalizarTipo(tipo: string): VehicleType {
  const t = tipo.toLowerCase();
  if (t === "sedan" || t === "sedán") return "Sedán";
  if (t === "camioneta") return "Camioneta";
  return "Moto";
}

function dbCodeToVisual(dbCode: string): string {
  // A-01 to A-30 -> A1-A10, B1-B10, C1-C10
  if (dbCode.startsWith('A-')) {
    const num = parseInt(dbCode.split('-')[1], 10);
    if (num <= 10) return `A${num}`;
    if (num <= 20) return `B${num - 10}`;
    return `C${num - 20}`;
  }
  // M-01 to M-15 -> M11-M15, M21-M25, M31-M35
  if (dbCode.startsWith('M-')) {
    const num = parseInt(dbCode.split('-')[1], 10);
    if (num <= 5) return `M1${num}`;
    if (num <= 10) return `M2${num - 5}`;
    return `M3${num - 10}`;
  }
  return dbCode;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ParkingContextValue {
  carSlots:           SlotMap;
  motoSlots:          SlotMap;
  historialSalidas:   ExitRecord[];
  vehiculosEnCurso:   VehiculoEnCurso[];
  disponibilidad:     DisponibilidadData | null;
  isLoading:          boolean;
  errorMsg:           string | null;

  // Queries
  getVehiculos:   () => Vehicle[];
  getFreeSlots:   (tipo: VehicleType) => string[];
  buscarVehiculo: (placa: string) => Vehicle | undefined;
  calcBilling:    (v: Vehicle) => BillingResult;

  // Mutations
  registrarEntradaAPI: (placa: string, tipo_vehiculo_id: number) => Promise<{ espacio: string; codigo_ticket: string; qr_base64?: string }>;
  registrarSalidaAPI:  (placa: string) => Promise<ExitRecord>;
  refrescarDatos:      () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ParkingContext = createContext<ParkingContextValue | null>(null);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const emptyCarSlots  = useMemo(() => generarSlots(CAR_ROWS), []);
  const emptyMotoSlots = useMemo(() => generarSlots(MOTO_ROWS), []);

  const [carSlots,          setCarSlots]          = useState<SlotMap>(emptyCarSlots);
  const [motoSlots,         setMotoSlots]          = useState<SlotMap>(emptyMotoSlots);
  const [historialSalidas,  setHistorial]          = useState<ExitRecord[]>([]);
  const [vehiculosEnCurso,  setVehiculosEnCurso]   = useState<VehiculoEnCurso[]>([]);
  const [disponibilidad,    setDisponibilidad]      = useState<DisponibilidadData | null>(null);
  const [isLoading,         setIsLoading]           = useState(false);
  const [errorMsg,          setErrorMsg]            = useState<string | null>(null);

  // ── Seed slots from API response ────────────────────────────────────────────

  const seedSlotsFromAPI = useCallback((vehiculos: VehiculoEnCurso[]) => {
    const newCarSlots  = generarSlots(CAR_ROWS);
    const newMotoSlots = generarSlots(MOTO_ROWS);

    vehiculos.forEach((v) => {
      const tipo = normalizarTipo(v.tipo);
      const visualSlot = dbCodeToVisual(v.espacio);
      const vehicle: Vehicle = {
        placa:   v.placa,
        tipo,
        entrada: new Date(v.fecha_hora_entrada),
        slotId:  visualSlot,
      };
      
      if (tipo === "Moto") {
        newMotoSlots[visualSlot] = vehicle;
      } else {
        newCarSlots[visualSlot] = vehicle;
      }
    });

    setCarSlots(newCarSlots);
    setMotoSlots(newMotoSlots);
  }, []);

  // ── Fetch data from API ────────────────────────────────────────────────────

  const refrescarDatos = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [dispData, vehicData, historyData] = await Promise.all([
        dashboardService.getDisponibilidad(),
        dashboardService.getVehiculosEnCurso(),
        operacionService.getHistorial(),
      ]);
      setDisponibilidad(dispData);
      setVehiculosEnCurso(vehicData);
      seedSlotsFromAPI(vehicData);

      // Mapear historial de la API al formato de la UI
      const mappedHistory: ExitRecord[] = historyData.map((h: any) => {
        const entrada = new Date(h.fecha_hora_entrada);
        const salida = new Date(h.fecha_hora_salida);
        const minsTotal = Math.max(0, Math.ceil((salida.getTime() - entrada.getTime()) / 60_000));
        const horasReales = Math.floor(minsTotal / 60);
        const horasACobrar = Math.ceil(minsTotal / 60);

        return {
          placa: h.placa,
          tipo: h.tipo_vehiculo || "Sedán",
          entrada,
          salida,
          horas: horasReales,
          horasACobrar,
          mins: minsTotal,
          total: parseFloat(h.valor_calculado) || 0,
        };
      });
      setHistorial(mappedHistory);

    } catch (err: any) {
      console.error("Error al cargar datos del parqueadero:", err);
      setErrorMsg(err.message || "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [seedSlotsFromAPI]);

  useEffect(() => {
    refrescarDatos();
    // Poll every 30 seconds to keep data fresh
    const interval = setInterval(refrescarDatos, 30_000);
    return () => clearInterval(interval);
  }, [refrescarDatos]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const getVehiculos = useCallback((): Vehicle[] => {
    return [
      ...(Object.values(carSlots).filter(Boolean)  as Vehicle[]),
      ...(Object.values(motoSlots).filter(Boolean) as Vehicle[]),
    ];
  }, [carSlots, motoSlots]);

  const getFreeSlots = useCallback(
    (tipo: VehicleType): string[] => {
      const map = tipo === "Moto" ? motoSlots : carSlots;
      return Object.entries(map)
        .filter(([, v]) => v === null)
        .map(([id]) => id);
    },
    [carSlots, motoSlots]
  );

  const buscarVehiculo = useCallback(
    (placa: string): Vehicle | undefined => {
      return getVehiculos().find((v) => v.placa === placa.toUpperCase());
    },
    [getVehiculos]
  );

  const calcBilling = useCallback((v: Vehicle): BillingResult => {
    const mins   = Math.max(1, Math.ceil((Date.now() - v.entrada.getTime()) / 60_000));
    const horasReales = Math.floor(mins / 60);
    const fracciones = Math.ceil(mins / 15);
    const tarifa = TARIFA[v.tipo] ?? 1000;
    return { 
      horas: horasReales, 
      horasACobrar: fracciones, // Fracciones de 15 min
      mins, 
      tarifa, 
      total: fracciones * tarifa 
    };
  }, []);

  // ── Mutations via API ──────────────────────────────────────────────────────

  const registrarEntradaAPI = useCallback(
    async (placa: string, tipo_vehiculo_id: number): Promise<{ espacio: string; codigo_ticket: string; qr_base64?: string }> => {
      const data = await operacionService.registrarEntrada(placa, tipo_vehiculo_id);
      // Refresh data to sync disponibilidad and vehiculosEnCurso
      await refrescarDatos();
      return { espacio: data.espacio, codigo_ticket: data.codigo_ticket, qr_base64: data.qr_base64 };
    },
    [refrescarDatos]
  );

  const registrarSalidaAPI = useCallback(
    async (placa: string): Promise<ExitRecord> => {
      const data = await operacionService.registrarSalida(placa);

      const salidaDate  = new Date(data.tiempo_salida);
      const entradaDate = new Date(data.tiempo_entrada);
      const mins  = Math.max(1, Math.ceil((salidaDate.getTime() - entradaDate.getTime()) / 60_000));

      const record: ExitRecord = {
        placa:   data.placa,
        tipo:    "Sedán",           // el backend no devuelve tipo, lo dejamos genérico
        entrada: entradaDate,
        salida:  salidaDate,
        horas:   Math.floor(mins / 60),
        horasACobrar: Math.ceil(mins / 15),
        mins,
        total:   data.total_pagar,
      };

      setHistorial((prev) => [record, ...prev]);
      // Refresh to sync slots and disponibilidad
      await refrescarDatos();
      return record;
    },
    [refrescarDatos]
  );

  // ── Value ──────────────────────────────────────────────────────────────────

  const value: ParkingContextValue = {
    carSlots,
    motoSlots,
    historialSalidas,
    vehiculosEnCurso,
    disponibilidad,
    isLoading,
    errorMsg,
    getVehiculos,
    getFreeSlots,
    buscarVehiculo,
    calcBilling,
    registrarEntradaAPI,
    registrarSalidaAPI,
    refrescarDatos,
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useParkingContext(): ParkingContextValue {
  const ctx = useContext(ParkingContext);
  if (!ctx) {
    throw new Error("useParkingContext must be used inside <ParkingProvider>");
  }
  return ctx;
}
