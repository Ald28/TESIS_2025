const { crearDisponibilidad } = require('../models/admin.model');

const crearDisponibilidadPsicologo = async (req, res) => {
  try {
    const { dia, mañana_inicio, mañana_fin, tarde_inicio, tarde_fin, psicologo_id } = req.body;
    console.log("📥 Datos recibidos:", req.body);

    if (!dia || !mañana_inicio || !mañana_fin || !tarde_inicio || !tarde_fin || !psicologo_id) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    await crearDisponibilidad(dia, mañana_inicio, mañana_fin, 'mañana', psicologo_id);
    await crearDisponibilidad(dia, tarde_inicio, tarde_fin, 'tarde', psicologo_id);

    return res.status(201).json({ mensaje: "✅ Disponibilidad creada correctamente." });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ mensaje: "Error del servidor." });
  }
};

module.exports = {
    crearDisponibilidadPsicologo,
};