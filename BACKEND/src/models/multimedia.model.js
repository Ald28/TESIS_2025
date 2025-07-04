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

const actualizarMultimedia = async (url) => {
  const sql = `INSERT INTO multimedia_actividad (url) VALUES (?)`;
  const result = await query(sql, [url]);
  return result.insertId;
};

const editarMetodos = async (id, { titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id, estudiante_id }) => {
  const sql = `
    UPDATE metodos
    SET titulo = ?, 
        descripcion = ?, 
        tipo = ?, 
        psicologo_id = ?, 
        multimedia_actividad_id = ?, 
        estudiante_id = ?
    WHERE id = ?
  `;
  const valores = [titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id, estudiante_id, id];
  const resultado = await query(sql, valores);
  return resultado;
};

const eliminarMetodo = async (id) => {
  const sql = `DELETE FROM metodos WHERE id = ?`;
  const result = await query(sql, [id]);
  return result;
};

module.exports = {crearMultimedia, insertarMultimedia, editarMetodos, actualizarMultimedia, eliminarMetodo};