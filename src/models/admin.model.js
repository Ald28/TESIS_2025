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
        e.edad,
        e.carrera
      FROM usuario u
      INNER JOIN estudiante e ON u.id = e.usuario_id
      WHERE u.rol_id = 2
    `;
    const resultado = await query(sql);
    return resultado;
};

const listarPsicologos = async () => {
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
      p.descripcion
    FROM usuario u
    INNER JOIN psicologo p ON u.id = p.usuario_id
    LEFT JOIN multimedia m ON u.multimedia_id = m.id
    WHERE u.rol_id = 1
  `;
    const resultado = await query(sql);
    return resultado;
};

const crearDisponibilidad = async (dia, hora_inicio, hora_fin, turno, psicologo_id) => {
    const verificarSql = `
    SELECT id FROM disponibilidad
    WHERE dia = ? AND turno = ? AND psicologo_id = ?
  `;
    const existentes = await query(verificarSql, [dia, turno, psicologo_id]);

    if (existentes.length > 0) {
        throw new Error(`Ya existe un turno '${turno}' registrado para el día '${dia}'.`);
    }

    const horaInicio = padHora(hora_inicio);
    const horaFin = padHora(hora_fin);

    if (turno === 'temrano') {
        if (horaInicio < '08:00:00' || horaFin > '11:59:59') {
            throw new Error("El horario de la mañana debe estar entre 08:00:00 y 11:59:59.");
        }
    } else if (turno === 'tarde') {
        if (horaInicio < '12:00:00' || horaFin > '18:00:00') {
            throw new Error("El horario de la tarde debe estar entre 12:00:00 y 18:00:00.");
        }
    }

    const insertarSql = `
    INSERT INTO disponibilidad (dia, hora_inicio, hora_fin, turno, psicologo_id)
    VALUES (?, ?, ?, ?, ?)
  `;
    await query(insertarSql, [dia, hora_inicio, hora_fin, turno, psicologo_id]);
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
    // Verificar si ya existe
    const existe = await query(`SELECT * FROM usuario WHERE correo = ?`, [correo]);
    if (existe.length > 0) {
        throw new Error("Ya existe un usuario con este correo.");
    }

    // Insertar usuario sin multimedia ni contraseña
    const usuario = await query(`
        INSERT INTO usuario (nombre, apellido, correo, rol_id)
        VALUES (?, ?, ?, 1)
    `, [nombre, apellido, correo]);

    const usuario_id = usuario.insertId;

    // Insertar en psicólogo
    await query(`
        INSERT INTO psicologo (usuario_id, especialidad, descripcion)
        VALUES (?, ?, ?)
    `, [usuario_id, especialidad, descripcion]);

    return usuario_id;
};

module.exports = {
    buscarAdminPorCorreo,
    listarEstudiantes,
    listarPsicologos,
    crearDisponibilidad,
    listarDisponibilidadPorTurno,
    registrarUsuarioPsicologoPreRegistro,
};