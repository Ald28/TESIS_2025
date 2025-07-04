const { query } = require('../config/conexion');

module.exports = {
  obtenerEstudiantesInactivos2Dias: async () => {
    const sql = `
      SELECT e.id AS estudiante_id, u.id AS usuario_id, u.nombre, u.apellido,
             u.ultima_conexion, u.ultima_notificacion_inactividad,
             p.id AS psicologo_id, up.id AS usuario_psicologo_id
      FROM estudiante e
      INNER JOIN usuario u ON u.id = e.usuario_id
      INNER JOIN seguimiento s ON s.estudiante_id = e.id
      INNER JOIN psicologo p ON p.id = s.psicologo_id
      INNER JOIN usuario up ON up.id = p.usuario_id
      WHERE TIMESTAMPDIFF(DAY, u.ultima_conexion, NOW()) >= 2
        AND (
          u.ultima_notificacion_inactividad IS NULL OR
          TIMESTAMPDIFF(DAY, u.ultima_notificacion_inactividad, NOW()) >= 2
        )
        AND u.estado = 'activo'
    `;
    return await query(sql);
  },

  registrarUltimaNotificacion: async (usuario_id) => {
    const sql = `
      UPDATE usuario
      SET ultima_notificacion_inactividad = NOW()
      WHERE id = ?
    `;
    return await query(sql, [usuario_id]);
  },

  obtenerCitasProximas: async () => {
    const sql = `
      SELECT c.id AS cita_id, c.fecha_inicio, c.psicologo_id, u.id AS usuario_psicologo_id,
             e.nombre AS estudiante_nombre, e.apellido AS estudiante_apellido
      FROM cita c
      INNER JOIN psicologo p ON p.id = c.psicologo_id
      INNER JOIN usuario u ON u.id = p.usuario_id
      INNER JOIN estudiante est ON est.id = c.estudiante_id
      INNER JOIN usuario e ON e.id = est.usuario_id
      WHERE c.estado = 'aceptada'
        AND TIMESTAMPDIFF(MINUTE, NOW(), c.fecha_inicio) BETWEEN 0 AND 5
    `;
    return await query(sql);
  }

};