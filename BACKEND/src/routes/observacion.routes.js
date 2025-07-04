const observacion = require('../controllers/observacion.controller');
const express = require('express');
const router = express.Router();

//RUTA PREDETERMINADA localhost:8080/api

// Ruta para crear una calificación
router.post('/calificaciones/crear', observacion.crearCalificacion);

// Ruta para listar calificaciones por estudiante
router.get('/calificaciones/estudiante/:estudiante_id', observacion.listarCalificacionesPorEstudiante);

// Ruta para editar calificacion
router.put('/calificaciones/editar/:id', observacion.editarCalificacion);

//Ruta para eliminar calificaion
router.delete("/calificaciones/eliminar/:id", observacion.eliminarCalificacion);

module.exports = router;