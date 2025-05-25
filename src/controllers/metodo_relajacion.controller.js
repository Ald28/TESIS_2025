const { enviarNotificacionSistema } = require('../services/notificacion.service');
const { obtenerPsicologoPorUsuarioId } = require('../models/psicologo.model');
const MetodoRelajacionService = require('../services/metodo_relajacion.service');
const multimediaModel = require('../models/multimedia.model');
const estudianteModel = require('../models/estudiante.model');
const psicologoModel = require('../models/psicologo.model');
const metodoModel = require('../models/metodo.model');

const subirMetodoRelajacion = async (req, res) => {
    try {
        const { titulo, descripcion, tipo, estudiante_id } = req.body;
        const usuario_id = req.usuario.id;

        const tiposPermitidos = ['privado', 'recomendado'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({ message: 'Tipo de método inválido. Debe ser "publico", "privado" o "recomendado".' });
        }

        if (tipo === 'privado' && !estudiante_id) {
            return res.status(400).json({ message: 'Debes seleccionar un estudiante para métodos privados.' });
        }

        if (tipo === 'recomendado' && estudiante_id) {
            return res.status(400).json({ message: 'No debes enviar estudiante_id para métodos recomendados.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Archivo multimedia requerido.' });
        }

        const psicologo = await obtenerPsicologoPorUsuarioId(usuario_id);
        if (!psicologo) {
            return res.status(404).json({ message: 'Psicólogo no encontrado' });
        }

        const psicologo_id = psicologo.id;

        if (tipo === 'privado' && !estudiante_id) {
            return res.status(400).json({ message: 'Debes seleccionar un estudiante para métodos privados.' });
        }

        if (tipo !== 'privado' && estudiante_id) {
            return res.status(400).json({ message: 'No debes enviar estudiante_id para métodos públicos.' });
        }

        const buffer = req.file.buffer;
        const url = await MetodoRelajacionService.subirArchivoACloudinary(buffer);

        const insertMultimedia = await multimediaModel.crearMultimedia({ url });

        await metodoModel.crearMetodo({
            titulo,
            descripcion,
            tipo,
            psicologo_id,
            multimedia_actividad_id: insertMultimedia.insertId,
            estudiante_id: tipo === 'privado' ? estudiante_id : null,
        });

        if (tipo === 'privado') {
            const estudianteInfo = await estudianteModel.obtenerUsuarioPorEstudianteId(estudiante_id);
            const infoPsicologo = await psicologoModel.obtenerNombreCompletoPsicologo(usuario_id);
            const nombrePsicologo = infoPsicologo?.nombre_completo || 'Psicólogo';

            if (estudianteInfo?.usuario_id) {
                try {
                    await enviarNotificacionSistema({
                        usuario_id: estudianteInfo.usuario_id,
                        titulo: 'Nueva Actividad Asignada',
                        mensaje: `Tu psicólogo ${nombrePsicologo} te ha asignado una nueva actividad personalizada.`,
                        tipo: 'recordatorio',
                    });
                    console.log('Notificación enviada al estudiante:', estudianteInfo.usuario_id);
                } catch (error) {
                    console.error('Error al enviar notificación push:', error.message || error);
                }
            } else {
                console.warn('⚠️ No se pudo enviar notificación: estudiante sin usuario_id');
            }
        }

        return res.status(201).json({ message: 'Método de relajación subido exitosamente.' });

    } catch (error) {
        console.error('Error al subir método de relajación:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const listarMetodosPrivados = async (req, res) => {
    try {
        const { estudiante_id } = req.params;

        if (!estudiante_id) {
            return res.status(400).json({ message: 'Estudiante ID requerido' });
        }

        const metodos = await metodoModel.listarMetodosPrivadosPorEstudiante(estudiante_id);

        res.json({ metodos });
    } catch (error) {
        console.error('Error al listar métodos privados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const listarMetodosRecomendados = async (req, res) => {
    try {
        const metodos = await metodoModel.listarMetodosRecomendados();
        res.json({ metodos });
    } catch (error) {
        console.error('Error al listar métodos recomendados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const listarTodosMetodosPrivados = async (req, res) => {
    try {
        const metodos = await metodoModel.listarTodosMetodosPrivados();
        res.json({ metodos });
    } catch (error) {
        console.error('Error al listar todos los métodos privados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const editarMetodoRelajacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo, estudiante_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!titulo || !tipo) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        const psicologo = await obtenerPsicologoPorUsuarioId(usuario_id);
        if (!psicologo) {
            return res.status(404).json({ message: 'Psicólogo no encontrado.' });
        }

        const psicologo_id = psicologo.id;
        let multimedia_actividad_id = req.body.multimedia_actividad_id;

        if (req.file) {
            const buffer = req.file.buffer;
            const url = await MetodoRelajacionService.subirArchivoACloudinary(buffer);
            const insertMultimedia = await multimediaModel.crearMultimedia({ url });
            multimedia_actividad_id = insertMultimedia.insertId;
        }

        const resultado = await multimediaModel.editarMetodos(id, {
            titulo,
            descripcion: descripcion || null,
            tipo,
            psicologo_id,
            multimedia_actividad_id,
            estudiante_id: tipo === 'privado' ? estudiante_id : null,
        });

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Método no encontrado.' });
        }

        res.status(200).json({ message: 'Método actualizado correctamente.' });

    } catch (error) {
        console.error('Error al editar método de relajación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const eliminarMetodoRelajacion = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await multimediaModel.eliminarMetodo(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Método no encontrado o ya eliminado.' });
        }

        res.status(200).json({ message: 'Método eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar método:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    subirMetodoRelajacion,
    listarMetodosPrivados,
    listarMetodosRecomendados,
    listarTodosMetodosPrivados,
    editarMetodoRelajacion,
    eliminarMetodoRelajacion,
};