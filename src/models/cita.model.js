const { query } = require('../config/conexion');
const { verificarEventosGoogleCalendar, eliminarEventoGoogleCalendar } = require('../services/google_calendar.service');

// Estudiante crea la cita
const crearCita = async ({ fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id }) => {
    const sql = `
        INSERT INTO cita (fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const resultado = await query(sql, [fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id]);
    return resultado.insertId;
};

const obtenerCitasPorEstudiante = async (estudiante_id) => {
    const sql = `
        SELECT c.*, u.nombre AS psicologo_nombre, u.apellido AS psicologo_apellido
        FROM cita c
        JOIN psicologo p ON c.psicologo_id = p.id
        JOIN usuario u ON p.usuario_id = u.id
        WHERE c.estudiante_id = ?
        ORDER BY c.fecha_inicio DESC
    `;
    const resultado = await query(sql, [estudiante_id]);
    return resultado;
};

// Listar las citas del psicologo
const obtenerCitasPorPsicologo = async (psicologo_id) => {
    const sql = `
        SELECT c.*, 
               e.id AS estudiante_id, 
               ue.nombre AS estudiante_nombre, 
               ue.apellido AS estudiante_apellido
        FROM cita c
        JOIN estudiante e ON c.estudiante_id = e.id
        JOIN usuario ue ON e.usuario_id = ue.id
        WHERE c.psicologo_id = ?
        ORDER BY c.fecha_inicio DESC
    `;
    const resultado = await query(sql, [psicologo_id]);
    return resultado;
};

// Obtener citas aceptadas por el psicólogo
const obtenerCitasAceptadasPorPsicologo = async (psicologo_id) => {
    const sql = `
        SELECT 
            c.*, 
            e.id AS estudiante_id, 
            ue.nombre AS estudiante_nombre, 
            ue.apellido AS estudiante_apellido,
            s.estado AS seguimiento_estado
        FROM cita c
        JOIN estudiante e ON c.estudiante_id = e.id
        JOIN usuario ue ON e.usuario_id = ue.id
        LEFT JOIN seguimiento s ON c.seguimiento_id = s.id
        WHERE c.psicologo_id = ? AND c.estado = 'aceptada'
        ORDER BY c.fecha_inicio DESC
    `;
    const resultado = await query(sql, [psicologo_id]);
    return resultado;
};

// El Psicologo acepta o rechaza la cita del estudiante
const actualizarEstadoCita = async ({ cita_id, estado, evento_google_id }) => {
    const sql = `
        UPDATE cita
        SET estado = ?, evento_google_id = ?
        WHERE id = ?
    `;
    await query(sql, [estado, evento_google_id, cita_id]);
};

// El estudiante al crear la cita se va a validar la disponibilidad del psicólogo
const validarDisponibilidad = async (psicologo_id, fecha_inicio, fecha_fin, estudiante_id) => {
    const diaSemana = fecha_inicio.toLocaleDateString('es-PE', { weekday: 'long' }).toLowerCase();

    //disponibilidad por día
    const disponibilidad = await query(`
        SELECT * FROM disponibilidad WHERE psicologo_id = ? AND dia = ?
    `, [psicologo_id, diaSemana]);

    if (!disponibilidad.length) {
        throw new Error(`El psicólogo no tiene disponibilidad los días ${diaSemana}`);
    }

    const fechaStr = fecha_inicio.toISOString().split('T')[0];

    let coincide = false;
    for (const disp of disponibilidad) {
        const inicioDisponible = new Date(`${fechaStr}T${disp.hora_inicio}`);
        const finDisponible = new Date(`${fechaStr}T${disp.hora_fin}`);

        if (fecha_inicio >= inicioDisponible && fecha_fin <= finDisponible) {
            coincide = true;
            break;
        }
    }

    if (!coincide) {
        const rangos = disponibilidad
            .map(d => `${d.hora_inicio} - ${d.hora_fin}`)
            .join(' o ');
        throw new Error(`La cita debe estar entre ${rangos} del día ${diaSemana}`);
    }

    // validar si el estudiante ya tiene una cita con ese psicólogo
    const citaEstudiante = await query(`
        SELECT * FROM cita
        WHERE estudiante_id = ? 
          AND estado IN ('pendiente', 'aceptada')
          AND (
            (fecha_inicio < ? AND fecha_fin > ?) OR
            (fecha_inicio >= ? AND fecha_inicio < ?)
          )
    `, [estudiante_id, fecha_fin, fecha_inicio, fecha_inicio, fecha_fin]);
    console.log('🔎 Validando conflicto estudiante:', citaEstudiante);

    if (citaEstudiante.length > 0) {
        throw new Error('Ya tienes una cita con este psicólogo en ese horario.');
    }

    // verificar si el psicólogo ya tiene una cita con otro estudiante
    const crucePsicologo = await query(`
        SELECT * FROM cita
        WHERE psicologo_id = ? 
          AND estudiante_id IS NOT NULL 
          AND estudiante_id != ? 
          AND estado IN ('pendiente', 'aceptada')
          AND (
            (fecha_inicio < ? AND fecha_fin > ?) OR
            (fecha_inicio >= ? AND fecha_inicio < ?)
          )
    `, [psicologo_id, estudiante_id, fecha_fin, fecha_inicio, fecha_inicio, fecha_fin]);

    if (crucePsicologo.length > 0) {
        throw new Error('El psicólogo ya tiene una cita programada en ese horario.');
    }

    // verificar si el psicólogo tiene un evento externo en Google Calendar
    const resultado = await query(`
        SELECT u.correo 
        FROM usuario u
        JOIN psicologo p ON u.id = p.usuario_id
        WHERE p.id = ?
    `, [psicologo_id]);

    const correoPsicologo = resultado[0]?.correo;
    if (correoPsicologo) {
        const ocupado = await verificarEventosGoogleCalendar(correoPsicologo, fecha_inicio, fecha_fin);
        if (ocupado) {
            throw new Error('El psicólogo tiene un evento en Google Calendar en ese horario.');
        }
    }

    // verificar si el estudiante ya tiene una cita activa (pendiente o aceptada)
    const citasActivas = await query(`
    SELECT * FROM cita 
    WHERE estudiante_id = ? 
      AND estado IN ('pendiente', 'aceptada')
`, [estudiante_id]);

    if (citasActivas.length > 0) {
        throw new Error('Ya tienes una cita pendiente o aceptada. Cancélala antes de agendar otra.');
    }

};

// Eliminar una cita por parte del estudiante
const cancelarCitaPorEstudiante = async (cita_id, estudiante_id) => {
    // Validar si la cita fue creada por el psicólogo
    const cita = await obtenerCitaPorId(cita_id);
    if (!cita) return false;

    if (cita.creado_por === 'psicologo') {
        throw new Error('No puedes cancelar una cita agendada por el psicólogo.');
    }

    // si la cita tiene evento y el correo del psicólogo
    const result = await query(`
      SELECT c.evento_google_id, u.correo
      FROM cita c
      JOIN psicologo p ON c.psicologo_id = p.id
      JOIN usuario u ON p.usuario_id = u.id
      WHERE c.id = ? AND c.estudiante_id = ? AND c.estado IN ('pendiente', 'aceptada')
    `, [cita_id, estudiante_id]);

    if (result.length === 0) return false;

    const { evento_google_id, correo } = result[0];

    if (evento_google_id) {
        await eliminarEventoGoogleCalendar(correo, evento_google_id);
    }

    const sql = `
      UPDATE cita
      SET estado = 'cancelada', evento_google_id = NULL
      WHERE id = ? AND estudiante_id = ?
    `;
    const resultado = await query(sql, [cita_id, estudiante_id]);

    return resultado.affectedRows > 0;
};

// Se lista para el usuario sus citas en estado pendiente o aceptada
const obtenerCitasActivasPorEstudiante = async (estudiante_id) => {
    const sql = `
      SELECT c.*, u.nombre AS psicologo_nombre, u.apellido AS psicologo_apellido
      FROM cita c
      JOIN psicologo p ON c.psicologo_id = p.id
      JOIN usuario u ON p.usuario_id = u.id
      WHERE c.estudiante_id = ?
        AND c.estado IN ('pendiente', 'aceptada')
      ORDER BY c.fecha_inicio ASC
    `;
    return await query(sql, [estudiante_id]);
};

const cancelarCitaPorPsicologo = async (cita_id, psicologo_id) => {
    // 1. Obtener los datos del evento (evento_google_id y correo del psicólogo)
    const resultado = await query(`
      SELECT c.evento_google_id, u.correo
      FROM cita c
      JOIN psicologo p ON c.psicologo_id = p.id
      JOIN usuario u ON p.usuario_id = u.id
      WHERE c.id = ? AND c.psicologo_id = ? AND c.estado = 'aceptada'
    `, [cita_id, psicologo_id]);

    if (resultado.length === 0) {
        return { exito: false, mensaje: 'Cita no encontrada o ya cancelada' };
    }

    const { evento_google_id, correo } = resultado[0];

    // 2. Eliminar el evento de Google Calendar si tiene ID
    if (evento_google_id) {
        await eliminarEventoGoogleCalendar(correo, evento_google_id);
    }

    // 3. Actualizar el estado de la cita
    await query(`
      UPDATE cita SET estado = 'cancelada' WHERE id = ? AND psicologo_id = ?
    `, [cita_id, psicologo_id]);

    return { exito: true };
};

// Listar las horas ocupadas por el psicólogo en una fecha específica
const obtenerHorasOcupadasPorPsicologo = async (psicologo_id, fecha) => {
    const sql = `
        SELECT DATE_FORMAT(fecha_inicio, '%H:%i') AS hora_inicio,
               DATE_FORMAT(fecha_fin, '%H:%i') AS hora_fin
        FROM cita
        WHERE psicologo_id = ?
          AND DATE(fecha_inicio) = ?
          AND estado IN ('pendiente', 'aceptada')
    `;
    return await query(sql, [psicologo_id, fecha]);
};

// Crear cita de seguimiento
const crearSeguimiento = async ({ estudiante_id, psicologo_id, fecha_inicio, fecha_fin, estado }) => {
    const sql = `
      INSERT INTO seguimiento (estudiante_id, psicologo_id, fecha_inicio, fecha_fin, estado)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [estudiante_id, psicologo_id, fecha_inicio, fecha_fin, estado]);
    return result.insertId;
};

const validarDisponibilidadParaSeguimiento = async (psicologo_id, fecha_inicio, fecha_fin, estudiante_id) => {
    const diaSemana = fecha_inicio.toLocaleDateString('es-PE', { weekday: 'long' }).toLowerCase();

    const disponibilidad = await query(`
        SELECT * FROM disponibilidad WHERE psicologo_id = ? AND dia = ?
    `, [psicologo_id, diaSemana]);

    if (!disponibilidad.length) {
        throw new Error(`El psicólogo no tiene disponibilidad los días ${diaSemana}`);
    }

    const fechaStr = fecha_inicio.toISOString().split('T')[0];
    const disponible = disponibilidad.some((bloque) => {
        const inicio = new Date(`${fechaStr}T${bloque.hora_inicio}`);
        const fin = new Date(`${fechaStr}T${bloque.hora_fin}`);
        return fecha_inicio >= inicio && fecha_fin <= fin;
    });

    if (!disponible) {
        throw new Error(`La cita debe estar dentro de algún rango disponible del día ${diaSemana}`);
    }

    // validar conflictos de horarios como antes...
    const crucePsicologo = await query(`
        SELECT * FROM cita
        WHERE psicologo_id = ? 
          AND estudiante_id IS NOT NULL 
          AND estudiante_id != ? 
          AND estado IN ('pendiente', 'aceptada')
          AND (
            (fecha_inicio < ? AND fecha_fin > ?) OR
            (fecha_inicio >= ? AND fecha_inicio < ?)
          )
    `, [psicologo_id, estudiante_id, fecha_fin, fecha_inicio, fecha_inicio, fecha_fin]);

    if (crucePsicologo.length > 0) {
        throw new Error('El psicólogo ya tiene una cita programada en ese horario.');
    }

    const resultado = await query(`
        SELECT u.correo 
        FROM usuario u
        JOIN psicologo p ON u.id = p.usuario_id
        WHERE p.id = ?
    `, [psicologo_id]);

    const correoPsicologo = resultado[0]?.correo;
    if (correoPsicologo) {
        const ocupado = await verificarEventosGoogleCalendar(correoPsicologo, fecha_inicio, fecha_fin);
        if (ocupado) {
            throw new Error('El psicólogo tiene un evento en Google Calendar en ese horario.');
        }
    }
};

const crearCitaActivada = async ({ fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id, seguimiento_id, estado = 'pendiente', creado_por = 'estudiante' }) => {
    const sql = `
        INSERT INTO cita (fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id, seguimiento_id, estado, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const resultado = await query(sql, [fecha, fecha_inicio, fecha_fin, estudiante_id, psicologo_id, seguimiento_id, estado, creado_por]);
    return resultado.insertId;
};

const obtenerCitaPorId = async (cita_id) => {
    const sql = `SELECT * FROM cita WHERE id = ?`;
    const result = await query(sql, [cita_id]);
    return result[0];
};

module.exports = {
    crearCita,
    obtenerCitasPorEstudiante,
    actualizarEstadoCita,
    obtenerCitasPorPsicologo,
    validarDisponibilidad,
    cancelarCitaPorEstudiante,
    obtenerCitasActivasPorEstudiante,
    obtenerCitasAceptadasPorPsicologo,
    cancelarCitaPorPsicologo,
    obtenerHorasOcupadasPorPsicologo,
    crearSeguimiento,
    validarDisponibilidadParaSeguimiento,
    crearCitaActivada,
    obtenerCitaPorId,
};