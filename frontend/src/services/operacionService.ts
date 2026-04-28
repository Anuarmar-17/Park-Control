import { fetchAPI } from './api';

export const operacionService = {
  registrarEntrada: (placa: string, tipo_vehiculo_id: number) => 
    fetchAPI('/operacion/entrada', {
      method: 'POST',
      body: JSON.stringify({ placa, tipo_vehiculo_id }),
    }),
    
  registrarSalida: (placa: string) => 
    fetchAPI('/operacion/salida', {
      method: 'POST',
      body: JSON.stringify({ placa }),
    }),

  getHistorial: () => 
    fetchAPI('/operacion/historial'),
};
