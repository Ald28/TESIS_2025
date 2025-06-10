const preguntaController = require('../controllers/pregunta.controller');
const validarToken = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();

//Ruta predeterminado al usar el API localhost:8080/api/

// Crear nueva pregunta
router.post('/crear-pregunta', preguntaController.crearPregunta);

// Crear nueva opción para una pregunta
router.post('/crear-opcion', preguntaController.crearOpcion);

// Crear respuesta por parte de un estudiante
router.post('/crear-respuesta', validarToken, preguntaController.crearRespuesta);

// Listar respuestas de un estudiante
router.get('/respuestas', preguntaController.listarTodasLasRespuestas);

// Listar preguntas con opciones
router.get('/listar-preguntas-opciones', preguntaController.listarPreguntasConOpciones);

// EDITAR PREGUNTA Y OPCION
router.put('/preguntas/:id', preguntaController.actualizarPreguntaYOpciones);

// ELIMINAR PREGUNTA Y OPCION
router.delete('/preguntas/:id', preguntaController.eliminarPreguntaYOpciones);

// Ruta para verificar si el estudiante ya respondió a alguna pregunta
router.get('/verificar-respuestas/:estudiante_id', preguntaController.verificarRespuestas);

module.exports = router;