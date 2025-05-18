const { query } = require('../config/conexion');

const buscarAdminPorCorreo = async (correo) => {
  const sql = `SELECT * FROM usuario WHERE correo = ? AND rol_id = 3`;
  const resultado = await query(sql, [correo]);
  return resultado[0] || null;
};

const listarEstudiantes = async () => {
  const sql = `
      SELECT 
        u.id AS usuario_id,
        u.nombre,
        u.apellido,
        u.correo,
        u.fecha_registro,
        u.rol_id,
        e.id AS estudiante_id,
        e.ciclo,
        e.fecha_nacimiento,
        e.carrera
      FROM usuario u
      INNER JOIN estudiante e ON u.id = e.usuario_id
      WHERE u.rol_id = 2
    `;
  const resultado = await query(sql);
  return resultado;
};

const listarPsicologos = async (estado = 'activo') => {
  const sql = `
    SELECT 
      u.id AS usuario_id,
      u.nombre,
      u.apellido,
      u.correo,
      u.fecha_registro,
      u.rol_id,
      m.url AS foto,
      p.id AS psicologo_id,
      p.especialidad,
      p.descripcion,
      u.estado
    FROM usuario u
    INNER JOIN psicologo p ON u.id = p.usuario_id
    LEFT JOIN multimedia m ON u.multimedia_id = m.id
    WHERE u.rol_id = 1 AND u.estado = ?
  `;
  const resultado = await query(sql, [estado]);
  return resultado;
};

const listarDisponibilidadPorTurno = async (psicologo_id) => {
  const sql = `
    SELECT dia, turno, hora_inicio, hora_fin
    FROM disponibilidad
    WHERE psicologo_id = ?
    ORDER BY FIELD(dia, 'lunes','martes','miércoles','jueves','viernes','sábado','domingo'), turno;
  `;
  const resultado = await query(sql, [psicologo_id]);
  return resultado;
};

const registrarUsuarioPsicologoPreRegistro = async ({ nombre, apellido, correo, especialidad, descripcion }) => {
  const existe = await query(`SELECT * FROM usuario WHERE correo = ?`, [correo]);
  if (existe.length > 0) {
    throw new Error("Ya existe un usuario con este correo.");
  }

  const usuario = await query(`
        INSERT INTO usuario (nombre, apellido, correo, rol_id)
        VALUES (?, ?, ?, 1)
    `, [nombre, apellido, correo]);

  const usuario_id = usuario.insertId;

  await query(`
        INSERT INTO psicologo (usuario_id, especialidad, descripcion)
        VALUES (?, ?, ?)
    `, [usuario_id, especialidad, descripcion]);

  return usuario_id;
};

const eliminarPsicologo = async (usuario_id) => {
  const sql = `
    UPDATE usuario
    SET estado = 'inactivo'
    WHERE id = ?
  `;
  const result = await query(sql, [usuario_id]);
  console.log("Resultado de la desactivación:", result);
  return result.affectedRows;
};

const activarPsicologo = async (usuario_id) => {
  const sql = `UPDATE usuario SET estado = 'activo' WHERE id = ?`;
  const result = await query(sql, [usuario_id]);
  return result.affectedRows;
};

module.exports = {
  buscarAdminPorCorreo,
  listarEstudiantes,
  listarPsicologos,
  listarDisponibilidadPorTurno,
  registrarUsuarioPsicologoPreRegistro,
  eliminarPsicologo,
  activarPsicologo,
};