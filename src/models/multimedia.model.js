const { query } = require('../config/conexion');

const crearMultimedia = async ({ url }) => {
    const sql = 'INSERT INTO multimedia_actividad (url) VALUES (?)';
    return await query(sql, [url]);
}

// CAMBIAR PERFIL ESTUDIANTE
const insertarMultimedia = async (url) => {
  const sql = `INSERT INTO multimedia (url) VALUES (?)`;
  const result = await query(sql, [url]);
  return result.insertId;
};

module.exports = {crearMultimedia, insertarMultimedia};