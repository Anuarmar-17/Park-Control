"use client";

import React from "react";
import { BaseModal } from "@/components/operario/TicketModal";

interface DeleteConfirmModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onConfirm: () => void;
  title:     string;
  message:   string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
        ⚠️
      </div>
      <h3>{title}</h3>
      <p>{message}</p>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cancelar</button>
        <button 
          className="btn-modal-primary" 
          style={{ background: "var(--danger)" }} 
          onClick={() => { onConfirm(); onClose(); }}
        >
          🗑 Eliminar Definitivamente
        </button>
      </div>
    </BaseModal>
  );
}
