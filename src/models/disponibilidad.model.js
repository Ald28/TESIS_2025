const { query } = require('../config/conexion');
const padHora = (hora) => (hora.length === 5 ? hora + ":00" : hora);

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

    // Validación de rangos permitidos
    if (mañanaInicio < '08:30:00' || mañanaFin > '12:31:59') {
        throw new Error("Horario de mañana inválido: debe estar entre 08:30 y 12:30.");
    }
    if (tardeInicio < '13:30:00' || tardeFin > '17:30:00') {
        throw new Error("Horario de tarde inválido: debe estar entre 13:30 y 17:30.");
    }

    // Validación de duración mínima de 4 horas (14400 segundos)
    const duracionHoras = (horaFin, horaInicio) => {
        const [h1, m1, s1] = horaFin.split(':').map(Number);
        const [h2, m2, s2] = horaInicio.split(':').map(Number);
        return (h1 * 3600 + m1 * 60 + s1) - (h2 * 3600 + m2 * 60 + s2);
    };

    const duracionMañana = duracionHoras(mañanaFin, mañanaInicio);
    const duracionTarde = duracionHoras(tardeFin, tardeInicio);

    const DURACION_MIN_MAÑANA = 14400;
    const DURACION_MIN_TARDE = 12600;
    const DURACION_MAX_TARDE = 14400;

    if (duracionMañana < DURACION_MIN_MAÑANA) {
        throw new Error("El horario de mañana debe tener al menos 4 horas.");
    }

    if (duracionTarde < DURACION_MIN_TARDE || duracionTarde > DURACION_MAX_TARDE) {
        throw new Error("El horario de tarde debe durar entre 3 horas y 30 minutos y 4 horas como máximo.");
    }

    // Verificar si ya existe disponibilidad
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

const editarDisponibilidad = async (id, psicologo_id, hora_inicio, hora_fin) => {
    const disponibilidad = await query(
        "SELECT turno, psicologo_id FROM disponibilidad WHERE id = ?",
        [id]
    );

    if (disponibilidad.length === 0) throw new Error("Disponibilidad no encontrada");

    const { turno, psicologo_id: dueño } = disponibilidad[0];
    if (dueño !== parseInt(psicologo_id)) {
        throw new Error("No tienes permiso para editar esta disponibilidad");
    }

    const inicio = padHora(hora_inicio);
    const fin = padHora(hora_fin);

    // Función para calcular la duración en segundos
    const duracionHoras = (horaFin, horaInicio) => {
        const [h1, m1, s1] = horaFin.split(':').map(Number);
        const [h2, m2, s2] = horaInicio.split(':').map(Number);
        return (h1 * 3600 + m1 * 60 + s1) - (h2 * 3600 + m2 * 60 + s2);
    };

    const duracion = duracionHoras(fin, inicio);

    if (turno === "temprano") {
        if (inicio < "08:30:00" || fin > "12:31:59") {
            throw new Error("El turno temprano debe estar entre 08:30 y 12:30.");
        }
        if (duracion < 14400) {
            throw new Error("El turno temprano debe durar al menos 4 horas.");
        }
    } else if (turno === "tarde") {
        if (inicio < "13:30:00" || fin > "17:30:00") {
            throw new Error("El turno tarde debe estar entre 13:30 y 17:30.");
        }
        if (duracion < 14400) {
            throw new Error("El turno tarde debe durar al menos 4 horas.");
        }
    }

    await query(
        `UPDATE disponibilidad SET hora_inicio = ?, hora_fin = ? WHERE id = ?`,
        [inicio, fin, id]
    );
};

const eliminarDisponibilidad = async (dia, turno, psicologo_id) => {
    const sql = `
    DELETE FROM disponibilidad
    WHERE dia = ? AND turno = ? AND psicologo_id = ?
  `;
    const result = await query(sql, [dia, turno, psicologo_id]);

    if (result.affectedRows === 0) {
        throw new Error("No se encontró la disponibilidad para eliminar.");
    }

    return result;
};

module.exports = {
    crearDisponibilidad,
    editarDisponibilidad,
    eliminarDisponibilidad,
}