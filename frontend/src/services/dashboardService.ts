import { fetchAPI } from './api';

export const dashboardService = {
  getDisponibilidad: () => 
    fetchAPI('/dashboard/disponibilidad', {
      method: 'GET',
    }),
    
  getVehiculosEnCurso: () => 
    fetchAPI('/dashboard/en-curso', {
      method: 'GET',
    }),
    
  getMetricasAdmin: () => 
    fetchAPI('/dashboard/metricas', {
      method: 'GET',
    }),

  getReportesMensuales: () =>
    fetchAPI('/dashboard/reportes-mensuales', {
      method: 'GET',
    }),

  getExportarReporte: (inicio: string, fin: string) => {
    const query = new URLSearchParams();
    if (inicio) query.append('inicio', inicio);
    if (fin) query.append('fin', fin);
    return fetchAPI(`/dashboard/exportar-reporte?${query.toString()}`, {
      method: 'GET',
    });
  },
};
