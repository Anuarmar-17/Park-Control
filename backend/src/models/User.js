const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT u.*, r.nombre AS rol_nombre 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.*, r.nombre AS rol_nombre 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(userData) {
    const { nombre, email, password, rol_id } = userData;
    const [result] = await db.execute(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES (?, ?, ?, ?)`,
      [nombre, email, password, rol_id]  // ← 'password' ya viene hasheado desde authController
    );
    return result.insertId;
  }
}

module.exports = User;
