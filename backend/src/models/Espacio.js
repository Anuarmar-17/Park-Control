const db = require('../config/db');

class Espacio {
  static async getEspacioDisponible(tipo_vehiculo_id) {
    const [rows] = await db.execute(
      `SELECT * FROM espacios 
       WHERE tipo_vehiculo_id = ? AND disponible = 1 
       LIMIT 1`,
      [tipo_vehiculo_id]
    );
    return rows[0];
  }

  static async ocupar(espacio_id) {
    await db.execute(
      `UPDATE espacios SET disponible = 0 WHERE id = ?`,
      [espacio_id]
    );
  }

  static async liberar(espacio_id) {
    await db.execute(
      `UPDATE espacios SET disponible = 1 WHERE id = ?`,
      [espacio_id]
    );
  }
}

module.exports = Espacio;
