const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'control_parqueadero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión inicial
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

module.exports = pool;
