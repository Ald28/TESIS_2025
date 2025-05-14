const psicologoController = require('../controllers/psicologo_auth.controller');
const authPsicologo = require('../middlewares/authPsicologo.js');
const express = require('express');
const router = express.Router();

//Ruta predeterminado al usar el API locoalhost:8080/auth/psicologo/

// Ruta para iniciar sesión
router.post('/google/psicologo', psicologoController.loginGooglePsicologo);
// Ruta para vincular google calendar
router.get('/google/calendar-login', psicologoController.iniciarOAuthGoogleCalendar);
// Ruta para llamar a google calendar
router.get('/google/calendar-callback', psicologoController.googleCalendarCallback);


// Ruta para listar a psicologos
router.get('/listar-psicologo', psicologoController.listarPsicologos);
// Ruta para listar psicologos por ID
router.get('/buscar-psicologo/:id', psicologoController.obtenerPsicologoPorUsuarioId);
// Perfil del psicólogo
router.get('/perfil/:usuario_id', psicologoController.obtenerPerfilPsicologo);


// Ruta para obtener la disponibilidad de un psicólogo
router.get('/disponibilidad/:id', psicologoController.obtenerDisponibilidadPorId);
// Ruta para listar las horas ocupadas
router.get('/horas-ocupadas/:psicologo_id/:fecha', psicologoController.obtenerHorasOcupadas);


// Ruta para listar citas de un psicólogo
router.get('/citas', psicologoController.obtenerCitasDelPsicologo); 
// Ruta para cancelar estado de cita
router.put('/citas/estado', psicologoController.cambiarEstadoCita);
// Ruta para obtener citas por estudiante
router.get('/citas-aceptadas', psicologoController.obtenerCitasAceptadas);
// Ruta para cancelar cita activas por estudiante
router.put('/cancelar-cita-psicologo', psicologoController.cancelarCitaPsicologo);
// Crear cita de seguimiento
router.post('/crear-cita-seguimiento', psicologoController.crearCitaSeguimiento);
// Listar citas de estudiantes
router.get('/historial-canceladas/:estudiante_id', psicologoController.obtenerHistorial);


// Listar estudiantes relacionados con el psicologo
router.get('/estudiantes-relacionados/:psicologo_id', psicologoController.estudiantePorPsicologo);

module.exports = router;