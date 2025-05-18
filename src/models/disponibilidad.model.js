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

    if (turno === "temprano") {
        if (inicio < "08:00:00" || fin > "11:59:59") {
            throw new Error("El turno temprano debe estar entre 08:00 y 11:59.");
        }
    } else if (turno === "tarde") {
        if (inicio < "12:00:00" || fin > "18:00:00") {
            throw new Error("El turno tarde debe estar entre 12:00 y 18:00.");
        }
    }

    await query(
        `UPDATE disponibilidad SET hora_inicio = ?, hora_fin = ? WHERE id = ?`,
        [inicio, fin, id]
    );
};

module.exports = {
    crearDisponibilidad,
    editarDisponibilidad,
}