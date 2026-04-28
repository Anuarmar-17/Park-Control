const db = require('../config/db');

class Registro {
  static async findActivoByPlaca(placa) {
    const [rows] = await db.execute(
      `SELECT * FROM REGISTROS 
       WHERE placa = ? AND estado = 'EN_CURSO' 
       ORDER BY id DESC LIMIT 1`,
      [placa]
    );
    return rows[0];
  }

  static async crearEntrada(data) {
    const { 
      placa, 
      tipo_vehiculo_id, 
      espacio_id, 
      usuario_entrada_id, 
      tarifa_id 
    } = data;
    
    const [result] = await db.execute(
      `INSERT INTO REGISTROS 
       (placa, tipo_vehiculo_id, espacio_id, usuario_entrada_id, tarifa_id, fecha_hora_entrada, estado) 
       VALUES (?, ?, ?, ?, ?, NOW(), 'EN_CURSO')`,
      [placa, tipo_vehiculo_id, espacio_id, usuario_entrada_id, tarifa_id]
    );
    return result.insertId;
  }

  static async registrarSalida(registro_id, usuario_salida_id, total_pagar) {
    await db.execute(
      `UPDATE REGISTROS 
       SET fecha_hora_salida = NOW(), 
           usuario_salida_id = ?, 
           valor_calculado = ?, 
           estado = 'FINALIZADO' 
       WHERE id = ?`,
      [usuario_salida_id, total_pagar, registro_id]
    );
  }

  static async generarTicket(registro_id, codigo) {
    const [result] = await db.execute(
      `INSERT INTO TICKETS (registro_id, codigo_ticket, fecha_emision) 
       VALUES (?, ?, NOW())`,
      [registro_id, codigo]
    );
    return result.insertId;
  }

  static async getRegistroConDetalles(registro_id) {
    const [rows] = await db.execute(
      `SELECT r.*, t.codigo_ticket AS codigo_unico 
       FROM REGISTROS r
       LEFT JOIN TICKETS t ON r.id = t.registro_id
       WHERE r.id = ?`,
      [registro_id]
    );
    return rows[0];
  }

  static async getHistorialReciente(limit = 10) {
    const parsedLimit = parseInt(limit, 10) || 10;
    const [rows] = await db.query(
      `SELECT r.*, tv.nombre AS tipo_vehiculo, t.codigo_ticket
       FROM REGISTROS r
       JOIN TIPOS_VEHICULO tv ON r.tipo_vehiculo_id = tv.id
       LEFT JOIN TICKETS t ON r.id = t.registro_id
       WHERE r.estado = 'FINALIZADO'
       ORDER BY r.fecha_hora_salida DESC
       LIMIT ${parsedLimit}`
    );
    return rows;
  }
}

module.exports = Registro;
