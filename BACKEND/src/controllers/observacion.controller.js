const { insertarCalificacion, obtenerCalificacionesPorEstudiante, actualizarCalificacion, eliminarComentario } = require('../models/observacion.model');

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

const editarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentario } = req.body;
        const psicologo_id = req.body.psicologo_id || req.user?.id;

        if (!comentario || !psicologo_id) {
            return res.status(400).json({ mensaje: 'Comentario y psicólogo son obligatorios.' });
        }

        await actualizarCalificacion(id, comentario, psicologo_id);

        res.status(200).json({ mensaje: 'Calificación actualizada correctamente.' });

    } catch (error) {
        console.error("Error al editar calificación:", error.message);
        res.status(403).json({ mensaje: error.message });
    }
};

const eliminarCalificacion = async (req, res) => {
    const { id } = req.params;
    const { psicologo_id } = req.body;

    try {
        await eliminarComentario(id, psicologo_id);
        res.status(200).json({ mensaje: "✅ Calificación eliminada correctamente." });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

module.exports = {
    crearCalificacion,
    listarCalificacionesPorEstudiante,
    editarCalificacion,
    eliminarCalificacion,
};