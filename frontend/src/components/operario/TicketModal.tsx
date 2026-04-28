import React from "react";
import { TARIFA } from "@/context/ParkingContext";
import type { Vehicle, ExitRecord } from "@/types/parking";

const pad = (n: number) => String(n).padStart(2, "0");
const fmtT = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtD = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── Entrada Modal ────────────────────────────────────────────────────────────

interface EntradaModalProps {
  isOpen:  boolean;
  onClose: () => void;
  vehicle: Pick<Vehicle, "placa" | "tipo" | "slotId" | "entrada"> | null;
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="t-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function EntradaModal({ isOpen, onClose, vehicle }: EntradaModalProps) {
  if (!vehicle) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box green">✅</div>
      <h3>Entrada Registrada</h3>
      <p>El vehículo fue registrado exitosamente en el sistema.</p>

      <div className="ticket-body">
        <TicketRow label="Placa"         value={vehicle.placa} />
        <TicketRow label="Tipo"          value={vehicle.tipo} />
        <TicketRow label="Espacio"       value={vehicle.slotId} />
        <TicketRow label="Fecha"         value={fmtD(vehicle.entrada)} />
        <TicketRow label="Hora entrada"  value={fmtT(vehicle.entrada)} />
        <div className="t-sep"></div>
        <TicketRow label="Tarifa / fracción" value={`$${(TARIFA[vehicle.tipo] ?? 0).toLocaleString("es-CO")}`} />
      </div>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cerrar</button>
        <button className="btn-modal-primary green" onClick={onClose}>Aceptar</button>
      </div>
    </BaseModal>
  );
}

// ─── Salida Modal ─────────────────────────────────────────────────────────────

interface SalidaModalProps {
  isOpen:  boolean;
  onClose: () => void;
  record:  ExitRecord | null;
  ticketNo?: string;
}

export function SalidaModal({ isOpen, onClose, record, ticketNo }: SalidaModalProps) {
  if (!record) return null;
  const tiempoStr = record.horas > 0
    ? `${record.horas}h ${record.mins % 60}min`
    : `${record.mins}min`;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box blue">🎫</div>
      <h3>Ticket de Salida</h3>
      <p>Proceso completado. Entrega este ticket al conductor.</p>

      <div className="ticket-body">
        {ticketNo && <TicketRow label="Ticket #" value={ticketNo} />}
        <TicketRow label="Placa"         value={record.placa} />
        <TicketRow label="Tipo"          value={record.tipo} />
        <div className="t-sep"></div>
        <TicketRow label="Entrada"       value={`${fmtD(record.entrada)} ${fmtT(record.entrada)}`} />
        <TicketRow label="Salida"        value={`${fmtD(record.salida)} ${fmtT(record.salida)}`} />
        <TicketRow label="Tiempo total"  value={tiempoStr} />
        <TicketRow label="Tarifa / fracción" value={`$${record.total ? Math.round(record.total / record.horasACobrar).toLocaleString("es-CO") : "—"}`} />
        <div className="t-sep"></div>
        <div className="t-row t-total">
          <span>TOTAL</span>
          <span>${record.total.toLocaleString("es-CO")}</span>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cerrar</button>
        <button className="btn-modal-primary blue" onClick={() => window.print()}>🖨 Imprimir Ticket</button>
      </div>
    </BaseModal>
  );
}
