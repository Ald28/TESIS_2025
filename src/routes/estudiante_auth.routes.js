const estudianteController = require('../controllers/estudiante_auth.controller');
const psicologoController = require('../controllers/psicologo_auth.controller');
const verificarAutenticacion = require('../middlewares/verificarAutenticacion');
const express = require('express');
const router = express.Router();

//Ruta predeterminado al usar el API https://tesis-2025.onrender.com/auth/

// Ruta para login de estudiante
router.post('/google/estudiante', estudianteController.loginGoogleEstudiante);
// Ruta para el perfil del estudiante
router.get('/perfil', estudianteController.obtenerPerfilEstudiante);
// Ruta crear la cita
router.post('/cita', estudianteController.crearCita);
// listar estudiantes
router.get('/estudiantes', estudianteController.listarTodosEstudiantes);
// Ruta para cancelar la cita
router.put('/cancelar-cita', estudianteController.cancelarCita);
// Ruta para obtener citas activas
router.get('/citas-activas', estudianteController.obtenerCitasActivas);
// Listar citas de estudiantes
router.get('/historial-canceladas/:estudiante_id', psicologoController.obtenerHistorial);
// Editar perfil estudiante
router.put("/editar-perfil", verificarAutenticacion.verificarToken,estudianteController.editarPerfilEstudiante);
// ULTIMA COENXCION ESTUDIANTE
router.put('/ultima-conexion/:id', estudianteController.actualizarConexion);

module.exports = router;