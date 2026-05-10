import { fetchAPI } from './api';
import type { Tarifa, Usuario } from '../types/parking';

// Mapeo de nombre UI → tipo_vehiculo_id en la BD
const TIPO_VEH_ID: Record<string, number> = {
  'Sedán':     1,
  'Camioneta': 2,
  'Moto':      3,
};

// Mapeo de nombre UI → tipo_cobro en la BD
const TIPO_COBRO_MAP: Record<string, string> = {
  'Fracción': 'fraccion',
  'Hora':     'hora',
  'Minuto':   'minuto',
  'Día':      'dia',
};

/** Convierte el objeto Tarifa del frontend al cuerpo que espera el backend */
function mapTarifaToAPI(data: Partial<Tarifa>) {
  return {
    tipo_vehiculo_id: TIPO_VEH_ID[data.tipo ?? ''] ?? null,
    nombre:    `Tarifa ${data.tipo} — ${data.cobro}`,
    tipo_cobro: TIPO_COBRO_MAP[data.cobro ?? ''] ?? 'hora',
    valor:     data.valor,
    activo:    data.activo ?? true,
    fecha_fin: null,
  };
}

/** Convierte el objeto Usuario del frontend al cuerpo que espera el backend */
function mapUsuarioToAPI(data: Partial<Usuario> & { password?: string }) {
  const ROL_ID: Record<string, number> = { 'Admin': 1, 'Operario': 2 };
  return {
    nombre:  data.nombre,
    email:   data.email,
    rol_id:  data.rol_id ?? ROL_ID[data.rol ?? ''] ?? 2,
    activo:  data.activo ?? true,
    ...(data.password ? { password: data.password } : {}),
  };
}

export const adminService = {
  // Tarifas
  getTarifas:    ()                       => fetchAPI('/admin/tarifas', { method: 'GET' }),
  createTarifa:  (data: Partial<Tarifa>)  => fetchAPI('/admin/tarifas',      { method: 'POST',   body: JSON.stringify(mapTarifaToAPI(data)) }),
  updateTarifa:  (id: number, data: Partial<Tarifa>) => fetchAPI(`/admin/tarifas/${id}`, { method: 'PUT', body: JSON.stringify(mapTarifaToAPI(data)) }),
  deleteTarifa:  (id: number)             => fetchAPI(`/admin/tarifas/${id}`, { method: 'DELETE' }),

  // Usuarios
  getUsuarios:   () => fetchAPI('/admin/usuarios', { method: 'GET' }),
  createUsuario: (data: Partial<Usuario> & { password?: string }) =>
    fetchAPI('/admin/usuarios', { method: 'POST', body: JSON.stringify(mapUsuarioToAPI(data)) }),
  updateUsuario: (id: number, data: Partial<Usuario> & { password?: string }) =>
    fetchAPI(`/admin/usuarios/${id}`, { method: 'PUT',  body: JSON.stringify(mapUsuarioToAPI(data)) }),
  deleteUsuario: (id: number) => fetchAPI(`/admin/usuarios/${id}`, { method: 'DELETE' }),
};

