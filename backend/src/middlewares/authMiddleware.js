const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado o formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, rol_id, email, ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    
    // Suponemos que req.user.rol_nombre viene en el token
    if (!rolesPermitidos.includes(req.user.rol_nombre)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
    }
    
    next();
  };
}

module.exports = {
  verificarToken,
  verificarRol
};
