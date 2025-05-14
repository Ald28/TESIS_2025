const {insertarCalificacion, obtenerCalificacionesPorEstudiante} = require('../models/observacion.model');

// Crear una calificación
const crearCalificacion = async (req, res) => {
    try {
        const { psicologo_id, estudiante_id, comentario } = req.body;

        if (!psicologo_id || !estudiante_id || !comentario) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        await insertarCalificacion({ comentario, psicologo_id, estudiante_id });
        res.status(201).json({ mensaje: "Calificación registrada correctamente" });

    } catch (error) {
        console.error("❌ Error al registrar calificación:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
};

// Listar calificaciones de un estudiante
const listarCalificacionesPorEstudiante = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const calificaciones = await obtenerCalificacionesPorEstudiante(estudiante_id);
        res.status(200).json(calificaciones);
    } catch (error) {
        console.error("❌ Error al listar calificaciones:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
};

module.exports = {
    crearCalificacion,
    listarCalificacionesPorEstudiante
};