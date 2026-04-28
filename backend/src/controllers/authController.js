const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id:      user.id,
        nombre:  user.nombre,
        email:   user.email,
        rol:     user.rol_nombre,   // nombre del rol: 'admin' | 'operario'
        rol_id:  user.rol_id,       // ← CRÍTICO para la redirección en el frontend
        activo:  user.activo,
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserId = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol_id
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUserId });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  login,
  register
};
