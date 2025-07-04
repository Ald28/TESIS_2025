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
           c.psicologo_id,
           p.usuario_id AS psicologo_usuario_id,
           u.nombre AS psicologo_nombre,
           u.apellido AS psicologo_apellido
    FROM calificaciones c
    JOIN psicologo p ON c.psicologo_id = p.id
    JOIN usuario u ON p.usuario_id = u.id
    WHERE c.estudiante_id = ?
    ORDER BY c.fecha_creacion DESC
  `;
  return await query(sql, [estudiante_id]);
};

const actualizarCalificacion = async (id, nuevoComentario, psicologo_id) => {
  const verificarSql = `SELECT * FROM calificaciones WHERE id = ? AND psicologo_id = ?`;
  const resultado = await query(verificarSql, [id, psicologo_id]);

  if (resultado.length === 0) {
    throw new Error('No puedes editar esta calificaciones porque no te pertenece.');
  }

  const actualizarSql = `UPDATE calificaciones SET comentario = ? WHERE id = ?`;
  await query(actualizarSql, [nuevoComentario, id]);
};

const eliminarComentario = async (id, psicologo_id) => {
  const verificarSql = `SELECT * FROM calificaciones WHERE id = ? AND psicologo_id = ?`;
  const resultado = await query(verificarSql, [id, psicologo_id]);

  if (resultado.length === 0) {
    throw new Error('No puedes eliminar esta calificación porque no te pertenece.');
  }

  const eliminarSql = `DELETE FROM calificaciones WHERE id = ?`;
  await query(eliminarSql, [id]);
};

module.exports = {
  insertarCalificacion,
  obtenerCalificacionesPorEstudiante,
  actualizarCalificacion,
  eliminarComentario,
};