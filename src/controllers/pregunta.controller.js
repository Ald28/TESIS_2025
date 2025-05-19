const respuestaModel = require('../models/respuesta.model');
const preguntaModel = require('../models/pregunta.model');

const crearPregunta = async (req, res) => {
    try {
        const { txt_pregunta, tipo, psicologo_id } = req.body;
        console.log(tipo, psicologo_id, txt_pregunta);

        if (!txt_pregunta || !tipo || !psicologo_id) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const preguntaId = await preguntaModel.crearPregunta({ txt_pregunta, tipo, psicologo_id });
        res.status(201).json({ message: "Pregunta creada", preguntaId });
    } catch (error) {
        console.error('Error al crear pregunta:', error.message);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const crearOpcion = async (req, res) => {
    try {
        const { txt_opcion, pregunta_id, psicologo_id } = req.body;

        if (!txt_opcion || !pregunta_id || !psicologo_id) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const opcionId = await preguntaModel.crearOpcion({ txt_opcion, pregunta_id, psicologo_id });
        res.status(201).json({ message: "Opción creada", opcionId });
    } catch (error) {
        console.error('Error al crear opción:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const crearRespuesta = async (req, res) => {
    try {
        const { pregunta_id, estudiante_id, opciones_id, respuesta_texto } = req.body;

        if (!pregunta_id || !estudiante_id) {
            return res.status(400).json({ message: "Faltan datos para registrar la respuesta" });
        }

        const respuestaId = await respuestaModel.crearRespuesta({
            pregunta_id,
            estudiante_id,
            opciones_id: opciones_id || null,
            respuesta_texto: respuesta_texto || null
        });

        res.status(201).json({ message: "Respuesta registrada exitosamente", respuestaId });
    } catch (error) {
        console.error('Error al registrar respuesta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const listarTodasLasRespuestas = async (req, res) => {
    try {
        const respuestas = await respuestaModel.listarTodasLasRespuestas();
        res.json({ respuestas });
    } catch (error) {
        console.error('Error al listar todas las respuestas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const listarPreguntasConOpciones = async (req, res) => {
    try {
        const preguntas = await preguntaModel.listarPreguntasConOpciones();

        const preguntasFormateadas = [];
        const preguntasMap = new Map();

        preguntas.forEach(p => {
            if (!preguntasMap.has(p.pregunta_id)) {
                preguntasMap.set(p.pregunta_id, {
                    id: p.pregunta_id,
                    txt_pregunta: p.txt_pregunta,
                    tipo: p.tipo,
                    opciones: []
                });
            }
            if (p.opcion_id) {
                preguntasMap.get(p.pregunta_id).opciones.push({
                    id: p.opcion_id,
                    txt_opcion: p.txt_opcion
                });
            }
        });

        preguntasFormateadas.push(...preguntasMap.values());

        res.json({ preguntas: preguntasFormateadas });
    } catch (error) {
        console.error('Error al listar preguntas con opciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const actualizarPreguntaYOpciones = async (req, res) => {
    const preguntaId = req.params.id;
    const { txt_pregunta, tipo, opciones } = req.body;

    try {
        await preguntaModel.editarPregunta({ id: preguntaId, txt_pregunta, tipo });

        if (tipo === "abierto") {
            await preguntaModel.eliminarOpcionesPorPregunta(preguntaId);
        }

        if (tipo === "cerrada" && Array.isArray(opciones)) {
            for (const opcion of opciones) {
                const { id, txt_opcion } = opcion;

                if (id) {
                    await preguntaModel.editarOpcion({ id, txt_opcion, pregunta_id: preguntaId });
                } else {
                    await preguntaModel.crearOpcion({
                        txt_opcion,
                        pregunta_id: preguntaId,
                        psicologo_id: req.body.psicologo_id || null,
                    });
                }
            }
        }

        res.status(200).json({ mensaje: 'Pregunta y opciones actualizadas correctamente' });
    } catch (error) {
        console.error('Error al editar pregunta y opciones:', error);
        res.status(500).json({ mensaje: 'Error al editar la pregunta' });
    }
};

module.exports = {
    crearPregunta,
    crearOpcion,
    listarTodasLasRespuestas,
    crearRespuesta,
    listarPreguntasConOpciones,
    actualizarPreguntaYOpciones
};