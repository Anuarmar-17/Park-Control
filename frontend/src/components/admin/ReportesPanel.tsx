"use client";

import React, { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboardService";
import { useToast } from "@/components/ui/Toast";

export function ReportesPanel() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await dashboardService.getReportesMensuales();
        setData(res);
      } catch (err) {
        console.error("Error al cargar datos de reportes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!fechaInicio || !fechaFin) {
      showToast("Selecciona fecha de inicio y fin", "error");
      return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      showToast("La fecha de inicio no puede ser mayor a la fecha de fin", "error");
      return;
    }

    setExportando(true);
    try {
      const records = await dashboardService.getExportarReporte(fechaInicio, fechaFin);
      
      if (!records || records.length === 0) {
        showToast("No hay registros en el período seleccionado", "warning");
        setExportando(false);
        return;
      }

      if (format === 'excel') {
        exportToCsv(records);
      } else {
        exportToPdf(records);
      }
    } catch (err: any) {
      showToast("Error al exportar reporte: " + err.message, "error");
    } finally {
      setExportando(false);
    }
  };

  const exportToCsv = (records: any[]) => {
    const headers = ['ID', 'Placa', 'Tipo Vehículo', 'Entrada', 'Salida', 'Valor Cobrado', 'Operario'];
    const csvRows = [headers.join(',')];

    records.forEach(r => {
      const row = [
        r.id,
        `"${r.placa}"`,
        `"${r.tipo_vehiculo}"`,
        `"${new Date(r.fecha_hora_entrada).toLocaleString('es-CO')}"`,
        `"${new Date(r.fecha_hora_salida).toLocaleString('es-CO')}"`,
        r.valor_calculado,
        `"${r.operario}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', `reporte_parqueadero_${fechaInicio}_a_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = (records: any[]) => {
    const win = window.open('', '_blank');
    if (!win) {
      showToast("El navegador bloqueó la ventana emergente para el PDF", "error");
      return;
    }

    const totalIngresos = records.reduce((sum, r) => sum + (parseFloat(r.valor_calculado) || 0), 0);

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte NubePark ${fechaInicio} a ${fechaFin}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          h1 { color: #1570ef; border-bottom: 2px solid #1570ef; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f5f7; color: #555; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary { margin-top: 20px; padding: 15px; background: #eff4ff; border-radius: 8px; border: 1px solid #b2ccf8; }
          .summary p { margin: 5px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Reporte de Operación - ParkControl</h1>
        <p><strong>Período:</strong> ${fechaInicio} al ${fechaFin}</p>
        
        <div class="summary">
          <p>Total de Vehículos: ${records.length}</p>
          <p>Ingresos Totales: $${totalIngresos.toLocaleString("es-CO")}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Cobro</th>
              <th>Operario</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => `
              <tr>
                <td>${r.placa}</td>
                <td>${r.tipo_vehiculo}</td>
                <td>${new Date(r.fecha_hora_entrada).toLocaleString('es-CO')}</td>
                <td>${new Date(r.fecha_hora_salida).toLocaleString('es-CO')}</td>
                <td>$${parseFloat(r.valor_calculado).toLocaleString('es-CO')}</td>
                <td>${r.operario}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  };

  const fmtMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${val.toLocaleString("es-CO")}`;
  };

  const getDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const deltaIngresos = data ? getDelta(data.ingresos_mes, data.ingresos_anterior) : 0;
  const deltaVehiculos = data ? getDelta(data.vehiculos_mes, data.vehiculos_anterior) : 0;

  return (
    <>
      <div className="alert alert-info" style={{ marginBottom: "24px", background: "var(--accent-soft)", padding: "16px", borderRadius: "var(--radius)", color: "var(--accent)", border: "1px solid #c5d9fc" }}>
        📊 Resumen de desempeño del mes actual. Puedes exportar el historial completo a continuación.
      </div>
      
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-label">Ingresos del Mes <span className="kpi-icon">📅</span></div>
          <div className="kpi-val">{loading ? "..." : fmtMoney(data?.ingresos_mes || 0)}</div>
          <div className="kpi-sub">
            <span className={`kpi-delta ${deltaIngresos >= 0 ? "up" : "down"}`}>
              {deltaIngresos >= 0 ? "▲" : "▼"} {Math.abs(Math.round(deltaIngresos))}%
            </span> vs mes anterior
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Vehículos / Mes <span className="kpi-icon">🚙</span></div>
          <div className="kpi-val">{loading ? "..." : (data?.vehiculos_mes || 0).toLocaleString()}</div>
          <div className="kpi-sub">
            <span className={`kpi-delta ${deltaVehiculos >= 0 ? "up" : "down"}`}>
              {deltaVehiculos >= 0 ? "▲" : "▼"} {Math.abs(Math.round(deltaVehiculos))}%
            </span> vs mes anterior
          </div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-label">Días Operativos <span className="kpi-icon">📆</span></div>
          <div className="kpi-val">{loading ? "..." : (data?.dias_operativos || 0)}</div>
          <div className="kpi-sub">Mes actual</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Tasa Ocupación <span className="kpi-icon">📈</span></div>
          <div className="kpi-val">{loading ? "..." : `${Math.round(data?.tasa_ocupacion || 0)}%`}</div>
          <div className="kpi-sub">Promedio actual</div>
        </div>
      </div>
      
      <div className="section-card">
        <h3>⬇ Exportar Reporte</h3>
        <p>Genera un informe del período seleccionado.</p>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Fecha Inicio</label>
            <input type="date" className="form-input" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Fin</label>
            <input type="date" className="form-input" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => handleExport('pdf')} disabled={exportando}>
            📄 {exportando ? 'Generando...' : 'Generar PDF'}
          </button>
          <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => handleExport('excel')} disabled={exportando}>
            📊 {exportando ? 'Exportando...' : 'Exportar Excel (CSV)'}
          </button>
        </div>
      </div>
    </>
  );
}
