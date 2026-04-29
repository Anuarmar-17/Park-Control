const db = require('../config/db');

class Tarifa {
  static async getTarifaActiva(tipo_vehiculo_id) {
    const [rows] = await db.execute(
      `SELECT * FROM tarifas 
       WHERE tipo_vehiculo_id = ? AND activo = 1 
       ORDER BY id DESC LIMIT 1`,
      [tipo_vehiculo_id]
    );
    return rows[0];
  }
}

module.exports = Tarifa;
