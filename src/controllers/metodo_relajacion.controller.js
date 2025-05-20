const metodoModel = require('../models/metodo.model');
const multimediaModel = require('../models/multimedia.model');
const MetodoRelajacionService = require('../services/metodo_relajacion.service');
const { obtenerPsicologoPorUsuarioId } = require('../models/psicologo.model');

const subirMetodoRelajacion = async (req, res) => {
    try {
        const { titulo, descripcion, tipo, estudiante_id } = req.body;
        const usuario_id = req.usuario.id;

        // Buscar el id del psicólogo
        const psicologo = await obtenerPsicologoPorUsuarioId(usuario_id);

        if (!psicologo) {
            return res.status(404).json({ message: 'Psicólogo no encontrado' });
        }

        const psicologo_id = psicologo.id; // Aquí sí obtenemos el id correcto

        if (!req.file) {
            return res.status(400).json({ message: 'Archivo multimedia requerido.' });
        }

        // Subir archivo a Cloudinary
        const buffer = req.file.buffer;
        const url = await MetodoRelajacionService.subirArchivoACloudinary(buffer);

        // Registrar en tabla multimedia_actividad
        const insertMultimedia = await multimediaModel.crearMultimedia({ url });

        // Crear el método en la tabla 'metodos'
        await metodoModel.crearMetodo({
            titulo,
            descripcion,
            tipo,
            psicologo_id, // Ahora sí, el verdadero id de la tabla psicologo
            multimedia_actividad_id: insertMultimedia.insertId,
            estudiante_id: tipo === 'privado' ? estudiante_id : null,
        });

        res.status(201).json({ message: 'Método de relajación subido exitosamente.' });

    } catch (error) {
        console.error('Error al subir método de relajación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
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

    const resultado = await metodoModel.eliminarMetodo(id);

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