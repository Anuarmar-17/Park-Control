const pool = require('../config/db');

// Obtener disponibilidad de cupos agrupados por tipo de vehículo
const getDisponibilidad = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          tv.nombre AS tipo,
          COUNT(e.id) AS total_cupos,
          SUM(CASE WHEN e.disponible = 1 THEN 1 ELSE 0 END) AS disponibles,
          SUM(CASE WHEN e.disponible = 0 THEN 1 ELSE 0 END) AS ocupados
      FROM TIPOS_VEHICULO tv
      JOIN ESPACIOS e ON tv.id = e.tipo_vehiculo_id
      GROUP BY tv.id;
    `);
    
    // Formatear la salida para que sea fácil de consumir en el frontend
    const result = {
      cars: { total: 0, libres: 0, ocupados: 0 },
      motos: { total: 0, libres: 0, ocupados: 0 }
    };

    rows.forEach(row => {
      // Convert string numbers to integers
      const total = parseInt(row.total_cupos, 10) || 0;
      const libres = parseInt(row.disponibles, 10) || 0;
      const ocupados = parseInt(row.ocupados, 10) || 0;

      if (row.tipo === 'sedán' || row.tipo === 'camioneta') {
        result.cars.total += total;
        result.cars.libres += libres;
        result.cars.ocupados += ocupados;
      } else if (row.tipo === 'moto') {
        result.motos.total += total;
        result.motos.libres += libres;
        result.motos.ocupados += ocupados;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error en getDisponibilidad:', error);
    res.status(500).json({ message: 'Error al obtener la disponibilidad de cupos' });
  }
};

// Obtener listado de vehículos actualmente en curso (parqueados)
const getVehiculosEnCurso = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          r.id,
          r.placa, 
          tv.nombre AS tipo, 
          e.codigo AS espacio, 
          r.fecha_hora_entrada,
          u.nombre AS registrado_por
      FROM REGISTROS r
      JOIN TIPOS_VEHICULO tv ON r.tipo_vehiculo_id = tv.id
      JOIN ESPACIOS e ON r.espacio_id = e.id
      JOIN USUARIOS u ON r.usuario_entrada_id = u.id
      WHERE r.estado = 'EN_CURSO';
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error en getVehiculosEnCurso:', error);
    res.status(500).json({ message: 'Error al obtener los vehículos en curso' });
  }
};

const getMetricasAdmin = async (req, res) => {
  try {
    // 1. Estadísticas del día (finalizados hoy)
    const [statsHoy] = await pool.query(`
      SELECT 
          COUNT(id) AS vehiculos_salidos,
          SUM(valor_calculado) AS total_dinero
      FROM REGISTROS 
      WHERE estado = 'FINALIZADO' 
      AND DATE(fecha_hora_salida) = CURDATE();
    `);
    
    // 2. Ocupación actual (en curso)
    const [ocupacionRows] = await pool.query(`
      SELECT 
          SUM(CASE WHEN tv.nombre IN ('sedán', 'camioneta') AND e.disponible = 0 THEN 1 ELSE 0 END) AS ocupacion_autos,
          SUM(CASE WHEN tv.nombre = 'moto' AND e.disponible = 0 THEN 1 ELSE 0 END) AS ocupacion_motos
      FROM ESPACIOS e
      JOIN TIPOS_VEHICULO tv ON e.tipo_vehiculo_id = tv.id
    `);

    // 3. Distribución por tipo de vehículo - HOY (entradas)
    const [distribucionHoy] = await pool.query(`
      SELECT tv.nombre, COUNT(r.id) as cantidad
      FROM TIPOS_VEHICULO tv
      LEFT JOIN REGISTROS r ON tv.id = r.tipo_vehiculo_id AND DATE(r.fecha_hora_entrada) = CURDATE()
      GROUP BY tv.id
    `);

    // 4. Últimos movimientos (10)
    const [ultimosMovimientos] = await pool.query(`
      SELECT 
          r.id,
          r.placa, 
          tv.nombre AS tipo, 
          r.fecha_hora_entrada AS entrada, 
          r.fecha_hora_salida AS salida,
          r.valor_calculado AS total,
          u.nombre AS operario,
          tf.valor AS tarifa_valor
      FROM REGISTROS r
      JOIN TIPOS_VEHICULO tv ON r.tipo_vehiculo_id = tv.id
      JOIN USUARIOS u ON r.usuario_salida_id = u.id
      LEFT JOIN TARIFAS tf ON r.tarifa_id = tf.id
      WHERE r.estado = 'FINALIZADO'
      ORDER BY r.fecha_hora_salida DESC
      LIMIT 10
    `);

    // 5. Ocupación por Zona (A=Autos, M=Motos)
    const [ocupacionPorZona] = await pool.query(`
      SELECT 
          SUBSTRING(codigo, 1, 1) as zona,
          COUNT(*) as total,
          SUM(CASE WHEN disponible = 0 THEN 1 ELSE 0 END) as ocupados
      FROM ESPACIOS
      GROUP BY zona
    `);

    res.json({
      vehiculos_salidos: parseInt(statsHoy[0].vehiculos_salidos, 10) || 0,
      total_dinero: parseFloat(statsHoy[0].total_dinero) || 0,
      ocupacion_autos: parseInt(ocupacionRows[0].ocupacion_autos, 10) || 0,
      ocupacion_motos: parseInt(ocupacionRows[0].ocupacion_motos, 10) || 0,
      distribucion: distribucionHoy,
      movimientos: ultimosMovimientos,
      zonas: ocupacionPorZona
    });
  } catch (error) {
    console.error('Error en getMetricasAdmin:', error);
    res.status(500).json({ message: 'Error al obtener las métricas de administrador' });
  }
};

// Obtener métricas mensuales para el panel de reportes
const getReportesMensuales = async (req, res) => {
  console.log('--- SOLICITUD REPORTES MENSUALES RECIBIDA ---');
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    console.log(`Buscando datos para Mes: ${currentMonth}, Año: ${currentYear}`);

    // 1. Datos mes actual
    const [mesActual] = await pool.query(`
      SELECT 
          COUNT(id) AS vehiculos_mes,
          SUM(valor_calculado) AS total_dinero_mes,
          COUNT(DISTINCT DATE(fecha_hora_salida)) AS dias_operativos
      FROM REGISTROS 
      WHERE estado = 'FINALIZADO' 
      AND MONTH(fecha_hora_salida) = MONTH(CURDATE())
      AND YEAR(fecha_hora_salida) = YEAR(CURDATE());
    `);

    // 2. Tasa de ocupación actual (promedio de todos los espacios)
    const [ocupacion] = await pool.query(`
      SELECT 
          (SUM(CASE WHEN disponible = 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS tasa_ocupacion
      FROM ESPACIOS;
    `);

    // 3. Datos mes anterior para deltas
    const [mesAnterior] = await pool.query(`
      SELECT 
          COUNT(id) AS vehiculos_mes,
          SUM(valor_calculado) AS total_dinero_mes
      FROM REGISTROS 
      WHERE estado = 'FINALIZADO' 
      AND MONTH(fecha_hora_salida) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      AND YEAR(fecha_hora_salida) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH));
    `);

    res.json({
      ingresos_mes: parseFloat(mesActual[0].total_dinero_mes) || 0,
      vehiculos_mes: parseInt(mesActual[0].vehiculos_mes, 10) || 0,
      dias_operativos: parseInt(mesActual[0].dias_operativos, 10) || 0,
      tasa_ocupacion: parseFloat(ocupacion[0].tasa_ocupacion) || 0,
      ingresos_anterior: parseFloat(mesAnterior[0].total_dinero_mes) || 0,
      vehiculos_anterior: parseInt(mesAnterior[0].vehiculos_mes, 10) || 0,
    });
  } catch (error) {
    console.error('Error en getReportesMensuales:', error);
    res.status(500).json({ message: 'Error al obtener reportes mensuales' });
  }
};

module.exports = {
  getDisponibilidad,
  getVehiculosEnCurso,
  getMetricasAdmin,
  getReportesMensuales
};
