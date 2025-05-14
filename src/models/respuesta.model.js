const { query } = require('../config/conexion');

const crearRespuesta = async ({ pregunta_id, estudiante_id, opciones_id, respuesta_texto = null }) => {
  const sql = `INSERT INTO respuestas (pregunta_id, estudiante_id, opciones_id, respuesta_texto) VALUES (?, ?, ?, ?)`;
  const result = await query(sql, [pregunta_id, estudiante_id, opciones_id, respuesta_texto]);
  return result.insertId;
};

const listarTodasLasRespuestas = async () => {
  const sql = `
    SELECT 
      r.id AS respuesta_id,
      r.fecha,
      p.txt_pregunta,
      p.tipo,
      o.txt_opcion,
      r.respuesta_texto,
      e.id AS estudiante_id,
      u.nombre AS nombre_estudiante,
      u.apellido AS apellido_estudiante,
      u.correo AS correo_estudiante
    FROM respuestas r
    JOIN pregunta p ON r.pregunta_id = p.id
    LEFT JOIN opciones o ON r.opciones_id = o.id
    JOIN estudiante e ON r.estudiante_id = e.id
    JOIN usuario u ON e.usuario_id = u.id
    ORDER BY r.fecha DESC
  `;
  return await query(sql);
};

module.exports = {
  crearRespuesta,
  listarTodasLasRespuestas
};