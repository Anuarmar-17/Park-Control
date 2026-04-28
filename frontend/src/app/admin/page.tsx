"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard }         from "@/components/ui/KpiCard";
import { MiniBarChart }    from "@/components/admin/MiniBarChart";
import { TarifaCard }      from "@/components/admin/TarifaCard";
import { TarifaForm }      from "@/components/admin/TarifaForm";
import { TarifasTable }    from "@/components/admin/TarifasTable";
import { MovimientosTable } from "@/components/admin/MovimientosTable";
import { UsuariosTable }   from "@/components/admin/UsuariosTable";
import { UsuarioModal }    from "@/components/admin/UsuarioModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { ReportesPanel }   from "@/components/admin/ReportesPanel";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { adminService }     from "@/services/adminService";
import type { Tarifa, Usuario, Movimiento, DashboardMetrics } from "@/types/parking";

// ─── Nav ──────────────────────────────────────────────────────────────────────
type TabId = "dashboard" | "tarifas" | "usuarios" | "reportes";

const SECTIONS = [
  { title: "Principal",     items: [{ id:"dashboard", label:"Dashboard", icon:"📊" }] },
  { title: "Configuración", items: [{ id:"tarifas", label:"Gestión de Tarifas", icon:"💲" }, { id:"usuarios", label:"Gestión de Usuarios", icon:"👥" }] },
  { title: "Sistema",       items: [{ id:"reportes", label:"Reportes", icon:"📑" }] },
];

const TOPBAR_INFO: Record<TabId, [string, string]> = {
  dashboard: ["Dashboard", "Resumen general del sistema"],
  tarifas:   ["Gestión de Tarifas", "Configura los precios por tipo de vehículo y modalidad de cobro"],
  usuarios:  ["Gestión de Usuarios", "Administra los accesos al sistema ParkControl"],
  reportes:  ["Reportes del Sistema", "Consulta históricos y genera informes de operación"],
};

// Capacidades fijas del parqueadero (autos=30, motos=15)
const CAP_AUTOS = 30;
const CAP_MOTOS = 15;

function AdminInner() {
  const { showToast } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // ── State: API data ─────────────────────────────────────────────────────────
  const [metrics,    setMetrics]    = useState<DashboardMetrics | null>(null);
  const [metricsErr, setMetricsErr] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [tarifas,   setTarifas]   = useState<Tarifa[]>([]);
  const [usuarios,  setUsuarios]  = useState<Usuario[]>([]);

  // ── State: Modals ───────────────────────────────────────────────────────────
  const [tarifaEdit, setTarifaEdit] = useState<Tarifa | null>(null);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [delUsuario, setDelUsuario] = useState<Usuario | null>(null);
  const [delTarifa,  setDelTarifa]  = useState<Tarifa | null>(null);

  // ── Load Dashboard Metrics ─────────────────────────────────────────────────
  const cargarMetricas = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsErr(null);
    try {
      const data = await dashboardService.getMetricasAdmin();
      setMetrics(data);
    } catch (err: any) {
      setMetricsErr(err.message || "Error al cargar métricas");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
    const interval = setInterval(cargarMetricas, 60_000);
    return () => clearInterval(interval);
  }, [cargarMetricas]);

  // ── Load Tarifas ───────────────────────────────────────────────────────────
  const cargarTarifas = useCallback(async () => {
    try {
      const data = await adminService.getTarifas();
      // Map API response to Tarifa type used in UI
      const mapped: Tarifa[] = data.map((t: any) => ({
        id:     t.id,
        tipo:   t.tipo_vehiculo ?? t.tipo_vehiculo_nombre ?? t.tipo ?? "—",
        cobro:  t.tipo_cobro ?? t.cobro ?? "Hora",
        valor:  parseFloat(t.valor) || 0,
        activo: !!t.activo,
      }));
      setTarifas(mapped);
    } catch (err: any) {
      showToast("Error al cargar tarifas: " + err.message, "error");
    }
  }, [showToast]);

  // ── Load Usuarios ──────────────────────────────────────────────────────────
  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await adminService.getUsuarios();
      const mapped: Usuario[] = data.map((u: any) => ({
        id:             u.id,
        nombre:         u.nombre,
        email:          u.email,
        rol:            u.rol ?? "operario",
        rol_id:         u.rol_id ?? (u.rol === "admin" ? 1 : 2),
        activo:         !!u.activo,
        ultimo_acceso:  u.ultimo_acceso ?? null,
      }));
      setUsuarios(mapped);
    } catch (err: any) {
      showToast("Error al cargar usuarios: " + err.message, "error");
    }
  }, [showToast]);

  // Load tarifas and usuarios when those tabs are first accessed
  useEffect(() => {
    if (activeTab === "tarifas")  cargarTarifas();
    if (activeTab === "usuarios") cargarUsuarios();
  }, [activeTab, cargarTarifas, cargarUsuarios]);

  // ── KPI helpers ────────────────────────────────────────────────────────────
  const totalHoy       = metrics?.total_dinero      ?? 0;
  const vehiculosHoy   = metrics?.vehiculos_salidos ?? 0;
  const ocupAutos      = metrics?.ocupacion_autos   ?? 0;
  const ocupMotos      = metrics?.ocupacion_motos   ?? 0;

  const barsZonas = (metrics?.zonas ?? []).map(z => ({
    label: `Zona ${z.zona} (${z.zona === 'A' ? 'Autos' : 'Motos'})`,
    value: z.ocupados,
    max: z.total,
    countLabel: `${z.ocupados}/${z.total} cupos`,
    color: z.zona === 'A' ? 'var(--accent)' : 'var(--amber)'
  }));

  const distItems = (metrics?.distribucion ?? []).map(d => ({
    label: d.nombre.charAt(0).toUpperCase() + d.nombre.slice(1),
    value: d.cantidad,
    color: d.nombre === 'moto' ? 'var(--wa)' : (d.nombre === 'sedán' ? 'var(--accent)' : 'var(--amber)')
  }));

  const mappedMovimientos: Movimiento[] = (metrics?.movimientos ?? []).map((m: any) => {
    const ent = new Date(m.entrada);
    const sal = new Date(m.salida);
    const diff = sal.getTime() - ent.getTime();
    const h = Math.floor(diff / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    return {
      id: m.id,
      placa: m.placa,
      tipo: m.tipo as any,
      entrada: ent,
      salida: sal,
      duracion: `${h}h ${min}m`,
      tarifa: m.tarifa_valor || 0,
      total: m.total || 0,
      operario: m.operario
    };
  });

  // ── Handlers: Tarifas ──────────────────────────────────────────────────────
  const handleSaveTarifa = async (data: Omit<Tarifa, "id">) => {
    try {
      if (tarifaEdit) {
        await adminService.updateTarifa(tarifaEdit.id, data);
        showToast(`Tarifa de ${data.tipo} actualizada`, "success");
      } else {
        await adminService.createTarifa(data);
        showToast(`Tarifa de ${data.tipo} creada`, "success");
      }
      setTarifaEdit(null);
      cargarTarifas();
    } catch (err: any) {
      showToast("Error al guardar tarifa: " + err.message, "error");
    }
  };

  const handleDeleteTarifa = async () => {
    if (!delTarifa) return;
    try {
      await adminService.deleteTarifa(delTarifa.id);
      showToast("Tarifa eliminada", "success");
      setDelTarifa(null);
      cargarTarifas();
    } catch (err: any) {
      showToast("Error al eliminar tarifa: " + err.message, "error");
    }
  };

  // ── Handlers: Usuarios ────────────────────────────────────────────────────
  const handleSaveUsuario = async (data: Omit<Usuario, "id" | "acceso">) => {
    try {
      if (usuarioEdit) {
        await adminService.updateUsuario(usuarioEdit.id, data);
        showToast(`Usuario ${data.nombre} actualizado`, "success");
      } else {
        await adminService.createUsuario(data);
        showToast(`Usuario ${data.nombre} creado`, "success");
      }
      setUsuarioEdit(null); setShowUsuarioModal(false);
      cargarUsuarios();
    } catch (err: any) {
      showToast("Error al guardar usuario: " + err.message, "error");
    }
  };

  const handleDeleteUsuario = async () => {
    if (!delUsuario) return;
    try {
      await adminService.deleteUsuario(delUsuario.id);
      showToast("Usuario eliminado", "success");
      setDelUsuario(null);
      cargarUsuarios();
    } catch (err: any) {
      showToast("Error al eliminar usuario: " + err.message, "error");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const [title, sub] = TOPBAR_INFO[activeTab];

  return (
    <DashboardLayout
      role="Admin"
      userName={user?.nombre ?? "Administrador"}
      userInitials={(user?.nombre ?? "A").substring(0, 2).toUpperCase()}
      userSub={user?.email ?? "admin@parqueadero.com"}
      sections={SECTIONS}
      activeId={activeTab}
      topbarTitle={title}
      topbarSub={sub}
      onNavigate={id => setActiveTab(id as TabId)}
      onLogout={handleLogout}
    >
      <div className="page-header">
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="panel active">
          {metricsErr && (
            <div className="alert alert-danger" style={{ marginBottom: "16px" }}>
              ⚠️ {metricsErr} —{" "}
              <button onClick={cargarMetricas} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                Reintentar
              </button>
            </div>
          )}

          <div className="kpi-grid">
            <KpiCard
              label="Ingresos del Día"
              value={metricsLoading ? "..." : `$${totalHoy.toLocaleString("es-CO")}`}
              diff={vehiculosHoy > 0 ? `▲ ${vehiculosHoy} salidas` : ""}
              subtext="hoy"
              icon=""
              color="green"
            />
            <KpiCard
              label="Vehículos Procesados Hoy"
              value={metricsLoading ? "..." : vehiculosHoy.toString()}
              subtext="salidas finalizadas"
              icon=""
              color="blue"
            />
            <KpiCard
              label="Ocupación Actual / Autos"
              value={metricsLoading ? "..." : `${Math.round((ocupAutos / CAP_AUTOS) * 100)}%`}
              subtext={`${ocupAutos} / ${CAP_AUTOS} cupos`}
              icon=""
              color="amber"
            />
            <KpiCard
              label="Ocupación Actual / Motos"
              value={metricsLoading ? "..." : `${Math.round((ocupMotos / CAP_MOTOS) * 100)}%`}
              subtext={`${ocupMotos} / ${CAP_MOTOS} cupos`}
              icon=""
              color="purple"
            />
          </div>

          <div className="stats-row">
            <MiniBarChart
              title="Tipos de Vehículo — Hoy"
              subtitle="Distribución de vehículos procesados"
              items={distItems}
            />
            <MiniBarChart
              title="Ocupación por Zona"
              subtitle="Estado actual de las zonas del parqueadero"
              items={barsZonas}
            />
          </div>

          <div style={{ marginTop: "24px" }}>
            <MovimientosTable movimientos={mappedMovimientos} />
          </div>
        </div>
      )}

      {/* ── Tarifas ──────────────────────────────────────────────────────── */}
      {activeTab === "tarifas" && (
        <div className="panel active">
          <div className="alert alert-info" style={{ marginBottom: "24px" }}>
            ℹ️ Los cambios en tarifas aplican a partir del siguiente registro. Los cobros en curso no se ven afectados.
          </div>
          <div className="tarifa-grid">
            {tarifas.filter(t => t.activo).reduce((unique, item) => {
              return unique.some(u => u.tipo === item.tipo) ? unique : [...unique, item];
            }, [] as Tarifa[]).map(t => (
              <TarifaCard key={t.id} tarifa={t} onEdit={(tarifa) => setTarifaEdit(tarifa)} />
            ))}
          </div>
          <TarifaForm editing={tarifaEdit} onSave={handleSaveTarifa} onCancel={() => setTarifaEdit(null)} />
          <TarifasTable tarifas={tarifas} onEdit={(tarifa) => setTarifaEdit(tarifa)} onDelete={(tarifa) => setDelTarifa(tarifa)} />
        </div>
      )}

      {/* ── Usuarios ─────────────────────────────────────────────────────── */}
      {activeTab === "usuarios" && (
        <div className="panel active">
          <UsuariosTable
            usuarios={usuarios}
            onNew={() => { setUsuarioEdit(null); setShowUsuarioModal(true); }}
            onEdit={(u) => { setUsuarioEdit(u); setShowUsuarioModal(true); }}
            onDelete={(u) => setDelUsuario(u)}
          />
        </div>
      )}

      {/* ── Reportes ─────────────────────────────────────────────────────── */}
      {activeTab === "reportes" && (
        <div className="panel active">
          <ReportesPanel />
        </div>
      )}

      <UsuarioModal
        isOpen={showUsuarioModal}
        onClose={() => setShowUsuarioModal(false)}
        editing={usuarioEdit}
        onSave={handleSaveUsuario}
      />

      <DeleteConfirmModal
        isOpen={!!delUsuario}
        onClose={() => setDelUsuario(null)}
        onConfirm={handleDeleteUsuario}
        title="Confirmar eliminación"
        message={`¿Seguro que deseas eliminar al usuario "${delUsuario?.nombre}"? Esta acción no se puede deshacer.`}
      />

      <DeleteConfirmModal
        isOpen={!!delTarifa}
        onClose={() => setDelTarifa(null)}
        onConfirm={handleDeleteTarifa}
        title="Confirmar eliminación"
        message={`¿Eliminar tarifa "${delTarifa?.tipo} / Por ${delTarifa?.cobro}"?`}
      />
    </DashboardLayout>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminInner />
    </ToastProvider>
  );
}
