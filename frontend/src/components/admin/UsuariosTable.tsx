"use client";

import React, { useState } from "react";
import type { Usuario } from "@/types/parking";

const pad = (n: number) => String(n).padStart(2, "0");

function fmtAcceso(val: Date | string | null | undefined): string {
  if (!val) return "Sin acceso";
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return "Sin acceso";
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

interface UsuariosTableProps {
  usuarios:  Usuario[];
  onNew:     () => void;
  onEdit:    (u: Usuario) => void;
  onDelete:  (u: Usuario) => void;
}

export function UsuariosTable({ usuarios, onNew, onEdit, onDelete }: UsuariosTableProps) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? usuarios.filter((u) => u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : usuarios;

  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>👤 Usuarios del Sistema</h3>
          <p><span id="total-usuarios">{usuarios.length}</span> usuarios registrados</p>
        </div>
        <div className="table-actions">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input 
              className="form-input" 
              placeholder="Buscar usuario..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ paddingLeft: "34px", width: "200px" }} 
            />
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={onNew}>＋ Nuevo Usuario</button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">Sin resultados</td></tr>
            ) : filtered.map((u) => {
              const initials = u.nombre.split(" ").map((x) => x[0]).slice(0, 2).join("");
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent), #2e90fa)",
                        display: "grid", placeItems: "center", color: "#fff",
                        fontSize: ".68rem", fontWeight: 700, flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: ".83rem" }}>{u.email}</td>
                  <td>
                    {u.rol === "Admin" 
                      ? <span className="chip chip-blue">Admin</span> 
                      : <span className="chip chip-gray">Operario</span>
                    }
                  </td>
                  <td>
                    {u.activo 
                      ? <span className="chip chip-green">● Activo</span> 
                      : <span className="chip chip-red">○ Inactivo</span>
                    }
                  </td>
                  <td className="time-pill">{fmtAcceso(u.acceso ?? u.ultimo_acceso)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-row" onClick={() => onEdit(u)}>Editar</button>
                      <button className="btn-row danger" onClick={() => onDelete(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
