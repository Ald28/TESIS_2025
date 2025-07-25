const { crearDisponibilidad, editarDisponibilidad,eliminarDisponibilidad } = require('../models/disponibilidad.model');
const {obtenerPsicologoPorUsuarioId} = require('../models/psicologo.model');

const crearDisponibilidadPsicologo = async (req, res) => {
  try {
    const { dia, mañana_inicio, mañana_fin, tarde_inicio, tarde_fin, psicologo_id } = req.body;

    if (!dia || !psicologo_id) {
      return res.status(400).json({ mensaje: "Día y psicólogo son obligatorios." });
    }

    const mañanaCompleta = mañana_inicio?.trim() && mañana_fin?.trim();
    const tardeCompleta = tarde_inicio?.trim() && tarde_fin?.trim();

    if (!(mañanaCompleta && tardeCompleta)) {
      return res.status(400).json({
        mensaje: "Para registrar disponibilidad, ambos turnos (mañana y tarde) deben estar completos.",
      });
    }

    await crearDisponibilidad(
      dia,
      mañana_inicio,
      mañana_fin,
      tarde_inicio,
      tarde_fin,
      psicologo_id
    );

    return res.status(201).json({
      mensaje: "Disponibilidad creada correctamente."
    });

  } catch (error) {
    console.error("Error en el controlador:", error.message);
    return res.status(500).json({
      mensaje: error.message || "Error del servidor."
    });
  }
};

const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fin, psicologo_id } = req.body;

    if (!hora_inicio || !hora_fin || !psicologo_id) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    await editarDisponibilidad(id, psicologo_id, hora_inicio, hora_fin);

    return res.status(200).json({ mensaje: "✅ Horario actualizado correctamente." });

  } catch (error) {
    console.error("❌ Error al actualizar disponibilidad:", error.message);
    return res.status(500).json({ mensaje: error.message });
  }
};

const quitarDisponibilidad = async (req, res) => {
  try {
    const { dia, turno } = req.params;
    const usuario_id = req.usuario.id;

    if (!dia || !turno) {
      return res.status(400).json({ message: "Día y turno son requeridos." });
    }
    
    const psicologo = await obtenerPsicologoPorUsuarioId(usuario_id);
    
    if (!psicologo) {
      return res.status(404).json({ message: "Psicólogo no encontrado" });
    }

    await eliminarDisponibilidad(dia.toLowerCase(), turno.toLowerCase(), psicologo.id);

    res.status(200).json({ message: `Disponibilidad del turno ${turno} para el día ${dia} eliminada correctamente.` });
  } catch (error) {
    console.error("Error al eliminar disponibilidad:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crearDisponibilidadPsicologo,
  cambiarDisponibilidad,
  quitarDisponibilidad,
};