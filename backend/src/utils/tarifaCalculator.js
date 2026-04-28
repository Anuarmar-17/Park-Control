/**
 * Calcula el total a pagar basándose en el tiempo transcurrido y la configuración de la tarifa.
 *
 * @param {Date} entrada - Fecha y hora de entrada
 * @param {Date} salida - Fecha y hora de salida
 * @param {Object} tarifa - Configuración de la tarifa { cobro: 'Hora'|'Minuto'|'Fracción'|'Día', valor: number }
 * @returns {number} - Total a cobrar
 */
function calcularTotal(entrada, salida, tarifa) {
  const diffMs = salida.getTime() - entrada.getTime();
  // Asegurar al menos 1 minuto si ha habido ingreso
  const diffMinutes = Math.max(1, Math.ceil(diffMs / (1000 * 60)));

  const cobro = tarifa.cobro || tarifa.tipo_cobro;

  switch (cobro) {
    case 'Minuto':
    case 'POR_MINUTO':
      return diffMinutes * tarifa.valor;
      
    case 'Hora':
    case 'POR_HORA':
      // Si cobra por hora, cualquier minuto empezado de la siguiente hora cuenta como hora completa
      const horas = Math.ceil(diffMinutes / 60);
      return horas * tarifa.valor;
 
    case 'Fracción':
    case 'FRACCION':
      // Se cobra por bloque de 15 minutos iniciado.
      const fracciones = Math.ceil(diffMinutes / 15);
      return fracciones * tarifa.valor;
 
    case 'Día':
    case 'POR_DIA':
      // Se cobra por día iniciado (bloques de 24 horas)
      const dias = Math.ceil(diffMinutes / (60 * 24));
      return dias * tarifa.valor;
 
    default:
      return 0;
  }
}

module.exports = { calcularTotal };
