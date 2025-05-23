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

const crearNotificacion = async ({ titulo, mensaje, tipo = 'sistema', usuario_id }) => {
  const sql = `
    INSERT INTO notificaciones (titulo, mensaje, tipo, usuario_id)
    VALUES (?, ?, ?, ?)
  `;
  return await query(sql, [titulo, mensaje, tipo, usuario_id]);
};

module.exports = {
  guardarTokenFCM,
  obtenerTokenPorUsuarioId,
  crearNotificacion,
};