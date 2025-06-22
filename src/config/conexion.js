require('dotenv').config();
const mysql = require('mysql2');

let conexion;

const connectWithRetry = () => {
  conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: '-05:00',
  });

  conexion.connect((error) => {
    if (error) {
      console.error('❌ Error de conexión a MySQL:', error.message);
      console.log('🔁 Reintentando conexión en 5 segundos...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('✅ Conexión exitosa a MySQL');
    }
  });
};

// iniciar conexión
connectWithRetry();

// ejecutar consultas SQL de manera asincrónica
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    conexion.execute(sql, params, (error, resultado) => {
      if (error) {
        console.error('❌ Error en la consulta SQL:', error.message);
        reject(error);
      } else {
        resolve(resultado);
      }
    });
  });
};

module.exports = { conexion, query };