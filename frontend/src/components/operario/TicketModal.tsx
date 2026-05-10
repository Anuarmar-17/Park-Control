"use client";

import React, { useRef } from "react";
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
  isOpen: boolean;
  onClose: () => void;
  vehicle: Pick<Vehicle, "placa" | "tipo" | "slotId" | "entrada"> | null;
  qrBase64?: string;
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="t-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function EntradaModal({ isOpen, onClose, vehicle, qrBase64 }: EntradaModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!vehicle) return null;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=340,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Ticket de Entrada – ParkControl</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: #fff;
            display: flex; justify-content: center; padding: 10px;
          }
          .receipt {
            width: 300px;
            background: #fff;
            border: 1px solid #ddd;
            font-size: 12px;
            color: #111;
          }
          .receipt-header {
            background: #079455;
            color: #fff;
            text-align: center;
            padding: 14px 10px 10px;
          }
          .receipt-header .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.03em; }
          .receipt-header .logo span { opacity: 0.8; }
          .receipt-header .subtitle { font-size: 10px; opacity: 0.85; margin-top: 2px; letter-spacing: 0.05em; text-transform: uppercase; }
          .receipt-type {
            text-align: center;
            padding: 8px;
            background: #ecfdf3;
            font-size: 11px; font-weight: 700; color: #079455; letter-spacing: 0.1em; text-transform: uppercase;
            border-bottom: 1px dashed #aee7c8;
          }
          .receipt-tear { border-top: 2px dashed #ccc; margin: 0; }
          .receipt-body { padding: 12px 14px; }
          .r-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 4px 0; font-size: 11.5px;
          }
          .r-row .r-label { color: #666; }
          .r-row .r-value { font-weight: 600; color: #111; font-family: 'DM Mono', monospace; }
          .r-sep { border-top: 1px dashed #ddd; margin: 6px 0; }
          .qr-section { text-align: center; padding: 10px 0 4px; }
          .qr-section p { font-size: 10px; color: #888; margin-bottom: 6px; letter-spacing: 0.04em; }
          .qr-section img { width: 110px; height: 110px; }
          .receipt-footer {
            border-top: 2px dashed #ccc;
            text-align: center;
            padding: 10px 8px 12px;
            font-size: 10px; color: #999;
          }
          .receipt-footer strong { color: #333; display: block; margin-bottom: 2px; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const now = vehicle.entrada instanceof Date ? vehicle.entrada : new Date();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box green">✅</div>
      <h3>Entrada Registrada</h3>
      <p>El vehículo fue registrado exitosamente en el sistema.</p>

      {/* Vista previa del ticket */}
      <div ref={printRef}>
        <div className="receipt">
          <div className="receipt-header" style={{ background: "#079455" }}>
            <div className="logo">Park<span>Control</span></div>
            <div className="subtitle">Ticket de Entrada</div>
          </div>
          <div className="receipt-type" style={{ background: "#ecfdf3", color: "#079455", borderBottom: "1px dashed #aee7c8" }}>✅ Entrada Registrada</div>
          <div className="receipt-tear" />
          <div className="receipt-body">
            <div className="r-row"><span className="r-label">Placa</span><span className="r-value">{vehicle.placa}</span></div>
            <div className="r-row"><span className="r-label">Tipo</span><span className="r-value">{vehicle.tipo}</span></div>
            <div className="r-row"><span className="r-label">Espacio</span><span className="r-value">{vehicle.slotId}</span></div>
            <div className="r-sep" />
            <div className="r-row"><span className="r-label">Fecha</span><span className="r-value">{fmtD(now)}</span></div>
            <div className="r-row"><span className="r-label">Hora entrada</span><span className="r-value">{fmtT(now)}</span></div>
            <div className="r-sep" />
            <div className="r-row"><span className="r-label">Tarifa / fracción</span><span className="r-value">${(TARIFA[vehicle.tipo] ?? 0).toLocaleString("es-CO")}</span></div>
            {qrBase64 && (
              <div className="qr-section">
                <p>Escanea para registrar salida</p>
                <img src={qrBase64} alt="QR de Salida" />
              </div>
            )}
          </div>
          <div className="receipt-footer">
            <strong>ParkControl — Control Inteligente</strong>
            Conserve este ticket para su salida
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cerrar</button>
        {qrBase64 && (
          <button className="btn-modal-primary green" onClick={handlePrint}>🖨 Imprimir Ticket</button>
        )}
        <button className="btn-modal-primary green" onClick={onClose} style={qrBase64 ? { flex: "0 0 auto", padding: "9px 14px" } : {}}>Aceptar</button>
      </div>
    </BaseModal>
  );
}

// ─── Salida Modal ─────────────────────────────────────────────────────────────

interface SalidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ExitRecord | null;
  ticketNo?: string;
}

export function SalidaModal({ isOpen, onClose, record, ticketNo }: SalidaModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const tiempoStr = record.horas > 0
    ? `${record.horas}h ${record.mins % 60}min`
    : `${record.mins}min`;

  const tarifaFraccion = record.total
    ? Math.round(record.total / record.horasACobrar).toLocaleString("es-CO")
    : "—";

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=340,height=650");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Ticket de Salida – ParkControl</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: #fff;
            display: flex; justify-content: center; padding: 10px;
          }
          .receipt {
            width: 300px;
            background: #fff;
            border: 1px solid #ddd;
            font-size: 12px;
            color: #111;
          }
          .receipt-header {
            background: #1570ef;
            color: #fff;
            text-align: center;
            padding: 14px 10px 10px;
          }
          .receipt-header .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.03em; }
          .receipt-header .logo span { opacity: 0.8; }
          .receipt-header .subtitle { font-size: 10px; opacity: 0.85; margin-top: 2px; letter-spacing: 0.05em; text-transform: uppercase; }
          .receipt-type {
            text-align: center;
            padding: 8px;
            background: #eff4ff;
            font-size: 11px; font-weight: 700; color: #1570ef; letter-spacing: 0.1em; text-transform: uppercase;
            border-bottom: 1px dashed #b2ccf8;
          }
          .receipt-tear { border-top: 2px dashed #ccc; margin: 0; }
          .receipt-body { padding: 12px 14px; }
          .r-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 4px 0; font-size: 11.5px;
          }
          .r-row .r-label { color: #666; }
          .r-row .r-value { font-weight: 600; color: #111; font-family: 'DM Mono', monospace; }
          .r-sep { border-top: 1px dashed #ddd; margin: 6px 0; }
          .r-total {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 0 4px; font-size: 14px; font-weight: 700;
          }
          .r-total .r-label { color: #111; }
          .r-total .r-value { color: #1570ef; font-family: 'DM Mono', monospace; font-size: 16px; }
          .receipt-footer {
            border-top: 2px dashed #ccc;
            text-align: center;
            padding: 10px 8px 12px;
            font-size: 10px; color: #999;
          }
          .receipt-footer strong { color: #333; display: block; margin-bottom: 2px; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box blue">🎫</div>
      <h3>Ticket de Salida</h3>
      <p>Proceso completado. Entrega este ticket al conductor.</p>

      {/* Vista previa del recibo */}
      <div ref={printRef}>
        <div className="receipt">
          <div className="receipt-header" style={{ background: "#1570ef" }}>
            <div className="logo">Park<span>Control</span></div>
            <div className="subtitle">Ticket de Salida</div>
          </div>
          <div className="receipt-type" style={{ background: "#eff4ff", color: "#1570ef", borderBottom: "1px dashed #b2ccf8" }}>🎫 Comprobante de Pago</div>
          <div className="receipt-tear" />
          <div className="receipt-body">
            {ticketNo && <div className="r-row"><span className="r-label">Ticket #</span><span className="r-value">{ticketNo}</span></div>}
            <div className="r-row"><span className="r-label">Placa</span><span className="r-value">{record.placa}</span></div>
            <div className="r-row"><span className="r-label">Tipo</span><span className="r-value">{record.tipo}</span></div>
            <div className="r-sep" />
            <div className="r-row"><span className="r-label">Entrada</span><span className="r-value">{fmtD(record.entrada)} {fmtT(record.entrada)}</span></div>
            <div className="r-row"><span className="r-label">Salida</span><span className="r-value">{fmtD(record.salida)} {fmtT(record.salida)}</span></div>
            <div className="r-row"><span className="r-label">Tiempo total</span><span className="r-value">{tiempoStr}</span></div>
            <div className="r-sep" />
            <div className="r-row"><span className="r-label">Tarifa / fracción</span><span className="r-value">${tarifaFraccion}</span></div>
            <div className="r-sep" />
            <div className="r-total">
              <span className="r-label">TOTAL A PAGAR</span>
              <span className="r-value">${record.total.toLocaleString("es-CO")}</span>
            </div>
          </div>
          <div className="receipt-footer">
            <strong>ParkControl — Control Inteligente</strong>
            Gracias por usar nuestro parqueadero
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cerrar</button>
        <button className="btn-modal-primary blue" onClick={handlePrint}>🖨 Imprimir Ticket</button>
      </div>
    </BaseModal>
  );
}
