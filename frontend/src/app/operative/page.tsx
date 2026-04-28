"use client";

import React, { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvailabilityCard } from "@/components/operario/AvailabilityCard";
import { EntradaForm }      from "@/components/operario/EntradaForm";
import { SalidaForm }       from "@/components/operario/SalidaForm";
import { VehicleTable }     from "@/components/operario/VehicleTable";
import { ExitHistoryTable } from "@/components/operario/ExitHistoryTable";
import { ParkingMap }       from "@/components/operario/ParkingMap";
import { EntradaModal, SalidaModal } from "@/components/operario/TicketModal";
import { ParkingProvider, useParkingContext, CAPACIDAD } from "@/context/ParkingContext";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import type { Vehicle, ExitRecord, AvailabilityInfo } from "@/types/parking";

type TabId = "entrada" | "salida" | "mapa";

const SECTIONS = [
  {
    title: "Operaciones",
    items: [
      { id: "entrada", label: "Registrar Entrada", icon: "📥" },
      { id: "salida",  label: "Registrar Salida",  icon: "📤" },
    ],
  },
  {
    title: "Informes",
    items: [
      { id: "mapa", label: "Mapa del Parqueadero", icon: "🗺️" },
    ],
  },
];

const TOPBAR_INFO: Record<TabId, [string, string]> = {
  entrada: ["Registrar Entrada", "Registro de ingreso de vehículos"],
  salida:  ["Registrar Salida",  "Cobro y salida de vehículos"],
  mapa:    ["Mapa del Parqueadero", "Estado visual de disponibilidad en tiempo real"],
};

function OperarioInner() {
  const { disponibilidad, historialSalidas, isLoading } = useParkingContext();
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>("entrada");

  // Modal state — entrada
  const [entradaModal, setEntradaModal] = useState<{ placa: string; slotId: string; ticket: string; tipo: any } | null>(null);
  // Modal state — salida
  const [salidaModal,  setSalidaModal]  = useState<ExitRecord | null>(null);
  const [ticketNo,     setTicketNo]     = useState("");

  // Compute AvailabilityInfo from real API data
  function calcStatus(free: number, total: number): AvailabilityInfo["status"] {
    if (free === 0)           return "full";
    if (free / total < 0.25) return "warn";
    return "ok";
  }

  const carsTotal = disponibilidad?.cars.total  ?? CAPACIDAD.cars;
  const carsFree  = disponibilidad?.cars.libres ?? CAPACIDAD.cars;
  const carsOcc   = disponibilidad?.cars.ocupados ?? 0;

  const motosTotal = disponibilidad?.motos.total  ?? CAPACIDAD.motos;
  const motosFree  = disponibilidad?.motos.libres ?? CAPACIDAD.motos;
  const motosOcc   = disponibilidad?.motos.ocupados ?? 0;

  const carsInfo: AvailabilityInfo = {
    free: carsFree, total: carsTotal, occupied: carsOcc,
    pct: Math.round((carsFree / carsTotal) * 100),
    status: calcStatus(carsFree, carsTotal),
  };
  const motosInfo: AvailabilityInfo = {
    free: motosFree, total: motosTotal, occupied: motosOcc,
    pct: Math.round((motosFree / motosTotal) * 100),
    status: calcStatus(motosFree, motosTotal),
  };

  const handleEntradaSuccess = useCallback((placa: string, slotId: string, ticket: string, tipo: any) => {
    setEntradaModal({ placa, slotId, ticket, tipo });
  }, []);

  const handleSalidaSuccess = useCallback((record: ExitRecord) => {
    setTicketNo(String(Date.now()).slice(-6));
    setSalidaModal(record);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const [title, subtitle] = TOPBAR_INFO[activeTab];

  return (
    <>
      <DashboardLayout
        role="Operario"
        userName={user?.nombre ?? "Operario"}
        userInitials={(user?.nombre ?? "O").substring(0, 2).toUpperCase()}
        userSub={user?.email ?? "Operario"}
        sections={SECTIONS}
        activeId={activeTab}
        topbarTitle={title}
        topbarSub={subtitle}
        onNavigate={(id) => setActiveTab(id as TabId)}
        onLogout={handleLogout}
      >
        <div className="page-header">
          <h1>Panel de Operario</h1>
          <p>Gestión de entradas y salidas del parqueadero</p>
        </div>

        {/* Tarjetas de disponibilidad — datos reales */}
        <div className="avail-grid">
          <AvailabilityCard type="cars"  label="Automóviles"  total={carsTotal}  info={carsInfo}  />
          <AvailabilityCard type="motos" label="Motocicletas" total={motosTotal} info={motosInfo} />
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", color: "var(--muted)", padding: "8px", fontSize: "0.78rem" }}>
            🔄 Actualizando datos…
          </div>
        )}

        {activeTab === "entrada" && (
          <div className="panel active">
            <div className="two-col">
              <EntradaForm onSuccess={handleEntradaSuccess} />
              <VehicleTable />
            </div>
          </div>
        )}

        {activeTab === "salida" && (
          <div className="panel active">
            <div className="two-col">
              <SalidaForm onSuccess={handleSalidaSuccess} />
              <ExitHistoryTable records={historialSalidas} />
            </div>
          </div>
        )}

        {activeTab === "mapa" && (
          <div className="panel active">
            <ParkingMap />
          </div>
        )}
      </DashboardLayout>

      {/* Modales de tickets */}
      <EntradaModal
        isOpen={!!entradaModal}
        onClose={() => setEntradaModal(null)}
        vehicle={entradaModal ? { placa: entradaModal.placa, tipo: entradaModal.tipo, entrada: new Date(), slotId: entradaModal.slotId } : null}
      />
      <SalidaModal
        isOpen={!!salidaModal}
        onClose={() => setSalidaModal(null)}
        record={salidaModal}
        ticketNo={ticketNo}
      />

      <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" title="Soporte WhatsApp" className="wa-btn">💬</a>
    </>
  );
}

export default function OperarioPage() {
  return (
    <ToastProvider>
      <ParkingProvider>
        <OperarioInner />
      </ParkingProvider>
    </ToastProvider>
  );
}
