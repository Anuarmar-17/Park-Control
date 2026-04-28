const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// --- TARIFAS ---

const getTarifas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.nombre, t.tipo_cobro, t.valor, t.activo, t.fecha_inicio, t.fecha_fin, tv.nombre AS tipo_vehiculo 
      FROM TARIFAS t
      JOIN TIPOS_VEHICULO tv ON t.tipo_vehiculo_id = tv.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tarifas:', error);
    res.status(500).json({ message: 'Error al obtener tarifas' });
  }
};

const createTarifa = async (req, res) => {
  const { tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO TARIFAS (tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio) VALUES (?, ?, ?, ?, ?)',
      [tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio || new Date()]
    );
    res.status(201).json({ id: result.insertId, message: 'Tarifa creada exitosamente' });
  } catch (error) {
    console.error('Error al crear tarifa:', error);
    res.status(500).json({ message: 'Error al crear tarifa' });
  }
};

const updateTarifa = async (req, res) => {
  const { id } = req.params;
  const { tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_fin } = req.body;
  try {
    await pool.query(
      'UPDATE TARIFAS SET tipo_vehiculo_id = ?, nombre = ?, tipo_cobro = ?, valor = ?, activo = ?, fecha_fin = ? WHERE id = ?',
      [tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_fin, id]
    );
    res.json({ message: 'Tarifa actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar tarifa:', error);
    res.status(500).json({ message: 'Error al actualizar tarifa' });
  }
};

const deleteTarifa = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM TARIFAS WHERE id = ?', [id]);
    res.json({ message: 'Tarifa eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tarifa:', error);
    res.status(500).json({ message: 'Error al eliminar tarifa (podría estar en uso)' });
  }
};

// --- USUARIOS ---

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.activo, u.ultimo_acceso, r.nombre AS rol 
      FROM USUARIOS u
      JOIN ROLES r ON u.rol_id = r.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const createUsuario = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO USUARIOS (nombre, email, password_hash, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, rol_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol_id, activo, password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await pool.query(
        'UPDATE USUARIOS SET nombre = ?, email = ?, rol_id = ?, activo = ?, password_hash = ? WHERE id = ?',
        [nombre, email, rol_id, activo, password_hash, id]
      );
    } else {
      await pool.query(
        'UPDATE USUARIOS SET nombre = ?, email = ?, rol_id = ?, activo = ? WHERE id = ?',
        [nombre, email, rol_id, activo, id]
      );
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM USUARIOS WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario (podría tener registros)' });
  }
};

module.exports = {
  getTarifas,
  createTarifa,
  updateTarifa,
  deleteTarifa,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
