"use client";

import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/operario/TicketModal";
import type { Usuario, UserRole } from "@/types/parking";

interface UsuarioModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  editing:  Usuario | null;
  onSave:   (data: Omit<Usuario, "id" | "acceso">) => void;
}

export function UsuarioModal({ isOpen, onClose, editing, onSave }: UsuarioModalProps) {
  const [nombre, setNombre] = useState("");
  const [email,  setEmail]  = useState("");
  const [rol,    setRol]    = useState<UserRole>("Operario");
  const [pass,   setPass]   = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (editing) {
      setNombre(editing.nombre); setEmail(editing.email);
      setRol(editing.rol); setPass(""); setActivo(editing.activo);
    } else {
      setNombre(""); setEmail(""); setRol("Operario"); setPass(""); setActivo(true);
    }
  }, [editing, isOpen]);

  const handleSave = () => {
    if (!nombre.trim())             return alert("El nombre es obligatorio.");
    if (!email.includes("@"))       return alert("Ingresa un email válido.");
    if (!editing && !pass.trim())   return alert("La contraseña es obligatoria.");
    onSave({ nombre: nombre.trim(), email: email.trim(), rol, activo });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-icon-box blue">👤</div>
      <h3>{editing ? "Editar Usuario" : "Agregar Nuevo Usuario"}</h3>
      <p>Completa los campos para crear el acceso.</p>

      <div className="form-grid" style={{ marginBottom: "20px" }}>
        <div className="field">
          <label>Nombre Completo</label>
          <input type="text" placeholder="Ej. María García" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="field">
          <label>Correo Electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ textTransform: "none", fontFamily: "var(--font-dm-sans)" }} />
        </div>
        <div className="field">
          <label>Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value as UserRole)}>
            <option value="Operario">Operario</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>
        <div className="field">
          <label>Contraseña {editing ? "(vacío para no cambiar)" : "Temporal"}</label>
          <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} style={{ textTransform: "none" }} />
        </div>
        <div className="field full">
          <label>Estado</label>
          <label className="switch-wrap">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            <span className="slider"></span>
            <span className="switch-label">Usuario activo</span>
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-modal-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-modal-primary blue" onClick={handleSave}>💾 Guardar Usuario</button>
      </div>
    </BaseModal>
  );
}
