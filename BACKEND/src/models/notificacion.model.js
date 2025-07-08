const { query } = require('../config/conexion');

const guardarTokenFCM = async ({ usuario_id, token, plataforma }) => {
  const sql = `
    INSERT INTO tokens_fcm (usuario_id, token, plataforma)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE token = VALUES(token), plataforma = VALUES(plataforma)
  `;
  return await query(sql, [usuario_id, token, plataforma]);
};

const obtenerTokenPorUsuarioId = async (usuario_id, plataforma = 'android') => {
  const sql = `SELECT token FROM tokens_fcm WHERE usuario_id = ? AND plataforma = ? LIMIT 1`;
  const result = await query(sql, [usuario_id, plataforma]);
  return result.length > 0 ? result[0].token : null;
};

const obtenerTokenPorUsuarioWeb = async (usuario_id, plataforma = 'web') => {
  const sql = `
    SELECT token 
    FROM tokens_fcm 
    WHERE usuario_id = ? AND plataforma = ? 
    ORDER BY fecha_registro DESC 
    LIMIT 1
  `;
  const result = await query(sql, [usuario_id, plataforma]);
  return result.length > 0 ? result[0].token : null;
};

const verificarExistenciaTokenFCM = async (token) => {
  const sql = `SELECT COUNT(*) AS existe FROM tokens_fcm WHERE token = ?`;
  const result = await query(sql, [token]);
  return result[0].existe > 0;
};

const crearNotificacion = async ({ titulo, mensaje, tipo = 'sistema', usuario_id }) => {
  const sql = `
    INSERT INTO notificaciones (titulo, mensaje, tipo, usuario_id)
    VALUES (?, ?, ?, ?)
  `;
  return await query(sql, [titulo, mensaje, tipo, usuario_id]);
};

const listarNotificacionesPorUsuarioId = async (usuario_id) => {
  const sql = `
    SELECT id, titulo, mensaje, tipo, fecha_envio
    FROM notificaciones
    WHERE usuario_id = ?
    ORDER BY fecha_envio DESC
  `;
  const result = await query(sql, [usuario_id]);
  return result;
};

const eliminarNotificaciones = async (id) =>{
  const sql = `
    DELETE FROM notificaciones
    WHERE id = ?
  `;
  return await query(sql, [id]);
}

const eliminarTokenFCM = async (token) => {
  const sql = `DELETE FROM notificaciones WHERE token_fcm = ?`;
  await query(sql, [token]);
};

module.exports = {
  guardarTokenFCM,
  eliminarTokenFCM,
  obtenerTokenPorUsuarioId,
  crearNotificacion,
  listarNotificacionesPorUsuarioId,
  eliminarNotificaciones,
  obtenerTokenPorUsuarioWeb,
  verificarExistenciaTokenFCM,
};