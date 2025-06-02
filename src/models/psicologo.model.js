const { query } = require('../config/conexion');

const crearPsicologo = async (psicologo) => {
  const sql = 'INSERT INTO psicologo (usuario_id, especialidad, descripcion) VALUES (?, ?, ?)';
  const { usuario_id, especialidad, descripcion } = psicologo;
  await query(sql, [usuario_id, especialidad, descripcion]);
};

const obtenerDisponibilidadPorPsicologo = async (psicologo_id) => {
  const sql = `SELECT id, dia, hora_inicio, hora_fin FROM disponibilidad WHERE psicologo_id = ? ORDER BY FIELD(dia, 'lunes','martes','miércoles','jueves','viernes','sábado','domingo'), hora_inicio`;
  const resultado = await query(sql, [psicologo_id]);
  return resultado;
};

const listarPsicologos = async () => {
  const sql = `
        SELECT 
            p.id AS psicologo_id,
            u.id AS usuario_id,
            u.nombre,
            u.apellido,
            u.correo,
            u.fecha_registro,
            u.multimedia_id,
            p.especialidad,
            p.descripcion
        FROM psicologo p
        JOIN usuario u ON p.usuario_id = u.id
        WHERE u.estado = 'activo'
    `;
  const resultados = await query(sql);
  return resultados;
};

const obtenerPsicologoPorUsuarioId = async (usuario_id) => {
  const sql = 'SELECT id FROM psicologo WHERE usuario_id = ?';
  const resultado = await query(sql, [usuario_id]);
  return resultado[0];
};

const obtenerDetallesCita = async (cita_id) => {
  const sql = `
        SELECT c.*, ue.correo AS correo_usuario, p.usuario_id AS usuario_psicologo
        FROM cita c
        JOIN estudiante e ON e.id = c.estudiante_id
        JOIN usuario ue ON ue.id = e.usuario_id
        JOIN psicologo p ON p.id = c.psicologo_id
        WHERE c.id = ?
    `;
  const resultado = await query(sql, [cita_id]);
  return resultado[0];
};

const obtenerNombreCompletoEstudiante = async (estudiante_id) => {
  const sql = `
        SELECT CONCAT(nombre, ' ', apellido) AS nombre_completo
        FROM usuario
        WHERE id = (SELECT usuario_id FROM estudiante WHERE id = ?)
    `;
  const resultado = await query(sql, [estudiante_id]);
  return resultado[0];
};

const obtenerNombreCompletoPsicologo = async (usuario_id) => {
  const sql = `
        SELECT correo, CONCAT(nombre, ' ', apellido) AS nombre_completo
        FROM usuario
        WHERE id = ?
    `;
  const resultado = await query(sql, [usuario_id]);
  return resultado[0];
};

const obtenerPsicologoConUsuario = async (usuario_id) => {
  const sql = `
        SELECT p.id AS psicologo_id, p.usuario_id, u.correo
        FROM psicologo p
        INNER JOIN usuario u ON p.usuario_id = u.id
        WHERE p.usuario_id = ?
    `;
  const resultado = await query(sql, [usuario_id]);
  return resultado[0];
};

const obtenerPerfilPsicologo = async (usuario_id) => {
  const sql = `
    SELECT 
      u.id AS usuario_id,
      u.nombre,
      u.apellido,
      u.correo,
      u.fecha_registro,
      u.estado,
      u.multimedia_id,
      m.url AS foto_url,
      p.id AS psicologo_id,
      p.especialidad,
      p.descripcion
    FROM psicologo p
    JOIN usuario u ON p.usuario_id = u.id
    LEFT JOIN multimedia m ON u.multimedia_id = m.id
    WHERE u.id = ?
  `;
  const resultado = await query(sql, [usuario_id]);
  return resultado[0];
};

const obtenerHistorial = async (estudiante_id) => {
  const sql = `
    SELECT 
      c.id AS cita_id,
      c.fecha,
      c.fecha_inicio,
      c.fecha_fin,
      c.evento_google_id,
      c.estado,
      c.creado_por,
      IF(c.seguimiento_id IS NULL, 'normal', 'seguimiento') AS tipo_cita,
      u.nombre AS nombre_psicologo,
      u.apellido AS apellido_psicologo
    FROM cita c
    JOIN psicologo p ON c.psicologo_id = p.id
    JOIN usuario u ON p.usuario_id = u.id
    WHERE c.estudiante_id = ?
      AND c.estado = 'realizada'
      AND c.evento_google_id IS NOT NULL
      AND (
        (c.creado_por = 'estudiante' AND c.seguimiento_id IS NULL)
        OR
        (c.creado_por = 'psicologo' AND c.seguimiento_id IS NOT NULL)
      )
    ORDER BY c.fecha_inicio DESC;
  `;
  return await query(sql, [estudiante_id]);
};

// buscar si el psicologo ya se conecto al google calendar
const verificarConexionGoogleCalendar = async (psicologo_id) => {
  const sql = `
    SELECT COUNT(*) AS conectado
    FROM google_tokens
    WHERE psicologo_id = ?
  `;
  const resultado = await query(sql, [psicologo_id]);
  return resultado[0].conectado > 0;
};

module.exports = {
  crearPsicologo,
  listarPsicologos,
  obtenerDisponibilidadPorPsicologo,
  obtenerPsicologoPorUsuarioId,
  obtenerDetallesCita,
  obtenerNombreCompletoEstudiante,
  obtenerNombreCompletoPsicologo,
  obtenerPsicologoConUsuario,
  obtenerPerfilPsicologo,
  obtenerHistorial,
  verificarConexionGoogleCalendar,
};