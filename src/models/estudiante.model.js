const { query } = require('../config/conexion');

const crearEstudiante = async (estudiante) => {
  const sql = 'INSERT INTO estudiante (usuario_id, ciclo, fecha_nacimiento, carrera) VALUES (?, ?, ?, ?)';
  const { usuario_id, ciclo, fecha_nacimiento, carrera } = estudiante;
  const result = await query(sql, [usuario_id, ciclo, fecha_nacimiento, carrera]);
  return result.insertId;
};

const obtenerDatosEstudiantePorId = async (usuario_id) => {
  const sql = `
        SELECT 
          e.id AS estudiante_id,
          u.id AS usuario_id,
          u.nombre,
          u.apellido,
          u.correo,
          u.rol_id,
          m.url AS foto,
          e.ciclo,
          e.edad,
          e.carrera
        FROM usuario u
        INNER JOIN estudiante e ON u.id = e.usuario_id
        LEFT JOIN multimedia m ON u.multimedia_id = m.id
        WHERE u.id = ?
    `;
  const resultado = await query(sql, [usuario_id]);
  return resultado[0];
};

const buscarPorUsuarioId = async (usuario_id) => {
  const sql = `SELECT * FROM estudiante WHERE usuario_id = ? LIMIT 1`;
  const result = await query(sql, [usuario_id]);
  return result.length > 0 ? result[0] : null;
};

const listarEstudiantes = async () => {
  const sql = `
        SELECT 
          e.id AS estudiante_id,
          u.id AS usuario_id,
          u.nombre,
          u.apellido
        FROM estudiante e
        INNER JOIN usuario u ON e.usuario_id = u.id
        WHERE u.rol_id = 2
    `;
  const resultado = await query(sql);
  return resultado;
};

const obtenerUsuarioPorEstudianteId = async (estudiante_id) => {
  const sql = `
        SELECT u.*
        FROM estudiante e
        INNER JOIN usuario u ON e.usuario_id = u.id
        WHERE e.id = ?
    `;
  const result = await query(sql, [estudiante_id]);
  return result[0];
};

const listarPorPsicologo = async (psicologo_id) => {
  const sql = `
    SELECT DISTINCT 
      e.id AS estudiante_id,
      u.id AS usuario_id,
      u.nombre,
      u.apellido,
      u.correo,
      e.ciclo,
      e.edad,
      e.carrera
    FROM estudiante e
    INNER JOIN usuario u ON u.id = e.usuario_id
    WHERE e.id IN (
      SELECT estudiante_id FROM cita WHERE psicologo_id = ?
      UNION
      SELECT estudiante_id FROM seguimiento WHERE psicologo_id = ?
    )
  `;
  const resultado = await query(sql, [psicologo_id, psicologo_id]);
  return resultado;
};

module.exports = {
  crearEstudiante,
  obtenerDatosEstudiantePorId,
  buscarPorUsuarioId,
  listarEstudiantes,
  obtenerUsuarioPorEstudianteId,
  listarPorPsicologo,
};