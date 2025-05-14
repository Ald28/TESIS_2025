const observacion = require('../controllers/observacion.controller');
const express = require('express');
const router = express.Router();

// Ruta para crear una calificación
router.post('/calificaciones/crear', observacion.crearCalificacion);

// Ruta para listar calificaciones por estudiante
router.get('/calificaciones/estudiante/:estudiante_id', observacion.listarCalificacionesPorEstudiante);

module.exports = router;
