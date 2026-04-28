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
};
