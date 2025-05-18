const { crearDisponibilidad } = require('../models/admin.model');

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

module.exports = {
  crearDisponibilidadPsicologo,
};