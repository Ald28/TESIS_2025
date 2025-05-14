const { query } = require('../config/conexion');

const insertarCalificacion = async ({ comentario, psicologo_id, estudiante_id }) => {
  const sql = `
    INSERT INTO calificaciones (comentario, psicologo_id, estudiante_id)
    VALUES (?, ?, ?)
  `;
  return await query(sql, [comentario, psicologo_id, estudiante_id]);
};

const obtenerCalificacionesPorEstudiante = async (estudiante_id) => {
  const sql = `
    SELECT c.id, c.comentario, c.fecha_creacion,
           p.usuario_id AS psicologo_usuario_id,
           u.nombre AS psicologo_nombre, u.apellido AS psicologo_apellido
    FROM calificaciones c
    JOIN psicologo p ON c.psicologo_id = p.id
    JOIN usuario u ON p.usuario_id = u.id
    WHERE c.estudiante_id = ?
    ORDER BY c.fecha_creacion DESC
  `;
  return await query(sql, [estudiante_id]);
};

module.exports = {
  insertarCalificacion,
  obtenerCalificacionesPorEstudiante
};