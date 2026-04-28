const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'defaultdb', // Aiven usa 'defaultdb' por defecto
  port: process.env.DB_PORT || 3306,             // ¡Añadido el puerto!
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ESTO ES LO QUE DEBES AGREGAR PARA AIVEN:
  ssl: {
    rejectUnauthorized: false 
  }
});

// Probar conexión inicial
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a Aiven MySQL establecida correctamente.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

module.exports = pool;