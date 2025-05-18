const { query } = require('../config/conexion');
const padHora = (hora) => (hora.length === 5 ? hora + ":00" : hora);

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

const crearDisponibilidad = async (dia, mañana_inicio, mañana_fin, tarde_inicio, tarde_fin, psicologo_id) => {
  const mañanaCompleta = mañana_inicio?.trim() && mañana_fin?.trim();
  const tardeCompleta = tarde_inicio?.trim() && tarde_fin?.trim();

  if (!(mañanaCompleta && tardeCompleta)) {
    throw new Error("Debes completar ambos horarios: mañana y tarde.");
  }

  const mañanaInicio = padHora(mañana_inicio);
  const mañanaFin = padHora(mañana_fin);
  const tardeInicio = padHora(tarde_inicio);
  const tardeFin = padHora(tarde_fin);

  if (mañanaInicio < '08:00:00' || mañanaFin > '11:59:59') {
    throw new Error("Horario de mañana inválido: 08:00 - 11:59.");
  }

  if (tardeInicio < '12:00:00' || tardeFin > '18:00:00') {
    throw new Error("Horario de tarde inválido: 12:00 - 18:00.");
  }

  const verificarSql = `
    SELECT turno FROM disponibilidad
    WHERE dia = ? AND psicologo_id = ?
  `;
  const existentes = await query(verificarSql, [dia, psicologo_id]);
  const turnosExistentes = existentes.map(e => e.turno);

  if (turnosExistentes.includes('temprano')) {
    throw new Error(`Ya existe una disponibilidad de mañana para ${dia}.`);
  }
  if (turnosExistentes.includes('tarde')) {
    throw new Error(`Ya existe una disponibilidad de tarde para ${dia}.`);
  }

  const insertarSql = `
    INSERT INTO disponibilidad (dia, hora_inicio, hora_fin, turno, psicologo_id)
    VALUES 
      (?, ?, ?, 'temprano', ?),
      (?, ?, ?, 'tarde', ?)
  `;

  await query(insertarSql, [
    dia, mañanaInicio, mañanaFin, psicologo_id,
    dia, tardeInicio, tardeFin, psicologo_id,
  ]);
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
  crearDisponibilidad,
  listarDisponibilidadPorTurno,
  registrarUsuarioPsicologoPreRegistro,
  eliminarPsicologo,
  activarPsicologo,
};