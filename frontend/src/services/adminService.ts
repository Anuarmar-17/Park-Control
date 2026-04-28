import { fetchAPI } from './api';
import type { Tarifa, Usuario } from '../types/parking';

export const adminService = {
  // Tarifas
  getTarifas: () => fetchAPI('/admin/tarifas', { method: 'GET' }),
  createTarifa: (data: Partial<Tarifa>) => fetchAPI('/admin/tarifas', { method: 'POST', body: JSON.stringify(data) }),
  updateTarifa: (id: number, data: Partial<Tarifa>) => fetchAPI(`/admin/tarifas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTarifa: (id: number) => fetchAPI(`/admin/tarifas/${id}`, { method: 'DELETE' }),

  // Usuarios
  getUsuarios: () => fetchAPI('/admin/usuarios', { method: 'GET' }),
  createUsuario: (data: Partial<Usuario>) => fetchAPI('/admin/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  updateUsuario: (id: number, data: Partial<Usuario>) => fetchAPI(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUsuario: (id: number) => fetchAPI(`/admin/usuarios/${id}`, { method: 'DELETE' }),
};
