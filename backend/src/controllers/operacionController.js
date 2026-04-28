const crypto = require('crypto');
const Espacio = require('../models/Espacio');
const Tarifa = require('../models/Tarifa');
const Registro = require('../models/Registro');
const { calcularTotal } = require('../utils/tarifaCalculator');

const registrarEntrada = async (req, res) => {
  try {
    const { placa, tipo_vehiculo_id } = req.body;
    const usuario_entrada_id = req.user.id; // Extraído del token JWT

    if (!placa || !tipo_vehiculo_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (placa, tipo_vehiculo_id).' });
    }

    // 1. Validar que el vehículo no tenga un registro activo
    const registroActivo = await Registro.findActivoByPlaca(placa);
    if (registroActivo) {
      return res.status(400).json({ error: 'El vehículo ya se encuentra en el parqueadero.' });
    }

    // 2. Verificar si hay cupo disponible
    const espacioLibre = await Espacio.getEspacioDisponible(tipo_vehiculo_id);
    if (!espacioLibre) {
      return res.status(400).json({ error: 'No hay cupos disponibles para este tipo de vehículo.' });
    }

    // 3. Obtener la tarifa activa para asociarla al registro (foto de la tarifa en este momento)
    const tarifaActiva = await Tarifa.getTarifaActiva(tipo_vehiculo_id);
    if (!tarifaActiva) {
      return res.status(400).json({ error: 'No existe una tarifa activa configurada para este vehículo.' });
    }

    // 4. Marcar espacio como ocupado
    await Espacio.ocupar(espacioLibre.id);

    // 5. Crear el registro
    const registroId = await Registro.crearEntrada({
      placa,
      tipo_vehiculo_id,
      espacio_id: espacioLibre.id,
      usuario_entrada_id,
      tarifa_id: tarifaActiva.id
    });

    // 6. Generar Ticket único
    const codigoTicket = crypto.randomBytes(4).toString('hex').toUpperCase(); // Ejemplo: '8F4B92C1'
    await Registro.generarTicket(registroId, codigoTicket);

    res.status(201).json({
      message: 'Entrada registrada exitosamente.',
      registro_id: registroId,
      espacio: espacioLibre.codigo,
      codigo_ticket: codigoTicket
    });

  } catch (error) {
    console.error('Error en registrarEntrada:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const registrarSalida = async (req, res) => {
  try {
    const { placa } = req.body;
    const usuario_salida_id = req.user.id;

    if (!placa) {
      return res.status(400).json({ error: 'Se requiere la placa.' });
    }

    const registro_activo = await Registro.findActivoByPlaca(placa);
    if (!registro_activo) {
      return res.status(404).json({ error: 'No hay un registro activo para esta placa.' });
    }

    const registro = await Registro.getRegistroConDetalles(registro_activo.id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado o ya finalizado.' });
    }

    // Obtener la información de la tarifa usada al entrar
    // Si queremos garantizar el historial completo, deberíamos cargar la tarifa a partir de registro.tarifa_id
    // Aquí simularemos traerla. (Lo ideal sería un Join o un FindById en Tarifa).
    const db = require('../config/db');
    const [tarifas] = await db.execute('SELECT * FROM TARIFAS WHERE id = ?', [registro.tarifa_id]);
    const tarifa = tarifas[0];

    if (!tarifa) {
      return res.status(500).json({ error: 'La tarifa asociada a este registro ya no existe.' });
    }

    // Calcular el tiempo y el total
    const fechaSalida = new Date();
    const totalPagar = calcularTotal(new Date(registro.fecha_hora_entrada), fechaSalida, tarifa);

    // Actualizar registro
    await Registro.registrarSalida(registro.id, usuario_salida_id, totalPagar);

    // Liberar espacio
    await Espacio.liberar(registro.espacio_id);

    res.json({
      message: 'Salida registrada exitosamente.',
      placa: registro.placa,
      tiempo_entrada: registro.fecha_hora_entrada,
      tiempo_salida: fechaSalida,
      total_pagar: totalPagar,
      codigo_ticket: registro.codigo_unico
    });

  } catch (error) {
    console.error('Error en registrarSalida:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const getHistorial = async (req, res) => {
  try {
    const historial = await Registro.getHistorialReciente(15);
    res.json(historial);
  } catch (error) {
    console.error('DETALLE ERROR HISTORIAL:', error);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
};

module.exports = {
  registrarEntrada,
  registrarSalida,
  getHistorial
};
