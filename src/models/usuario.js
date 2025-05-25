const { query } = require('../config/conexion');

const buscarUsuarioPorCorreo = async (correo) => {
  const sql = 'SELECT * FROM usuario WHERE correo = ?';
  const resultado = await query(sql, [correo]);
  return resultado;
};

const insertarMultimedia = async (url) => {
  const sql = 'INSERT INTO multimedia (url) VALUES (?)';
  const resultado = await query(sql, [url]);
  return resultado.insertId;
};

const crearUsuario = async (usuario) => {
  const sql = 'INSERT INTO usuario (nombre, apellido, correo, rol_id, multimedia_id) VALUES (?, ?, ?, ?, ?)';
  const { nombre, apellido, correo, rol_id, multimedia_id } = usuario;
  const resultado = await query(sql, [nombre, apellido, correo, rol_id, multimedia_id]);
  return resultado.insertId;
};

const actualizarMultimediaUsuario = async (usuario_id, multimedia_id) => {
  const sql = `UPDATE usuario SET multimedia_id = ? WHERE id = ?`;
  await query(sql, [multimedia_id, usuario_id]);
};

const buscarUsuarioPorId = async (id) => {
  const sql = 'SELECT * FROM usuario WHERE id = ?';
  const resultado = await query(sql, [id]);
  return resultado[0]; 
};

const actualizarUltimaConexion = async (usuario_id) => {
  const sql = 'UPDATE usuario SET ultima_conexion = NOW() WHERE id = ?';
  await query(sql, [usuario_id]);
};

const obtenerEstudiantesInactivos = async (diasInactividad) => {
  const sql = `
    SELECT id AS usuario_id
    FROM usuario
    WHERE rol = 'estudiante'
      AND TIMESTAMPDIFF(DAY, ultima_conexion, NOW()) >= ?
  `;
  return await query(sql, [diasInactividad]);
};

module.exports = {
  buscarUsuarioPorCorreo,
  insertarMultimedia,
  crearUsuario,
  actualizarMultimediaUsuario,
  buscarUsuarioPorId,
  actualizarUltimaConexion,
  obtenerEstudiantesInactivos,
};