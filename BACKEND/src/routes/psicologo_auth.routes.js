const psicologoController = require('../controllers/psicologo_auth.controller');
const disponibilidad = require('../controllers/disponibilidad.controller');
const {verificarToken} = require('../middlewares/verificarAutenticacion');
const authPsicologo = require('../middlewares/authPsicologo');
const express = require('express');
const router = express.Router();

//Ruta predeterminado al usar el API locoalhost:8080/auth/psicologo/

// Ruta para iniciar sesión
router.post('/google/psicologo', psicologoController.loginGooglePsicologo);
// Ruta para vincular google calendar
router.get('/google/calendar-login', psicologoController.iniciarOAuthGoogleCalendar);
// Ruta para llamar a google calendar
router.get('/google/calendar-callback', psicologoController.googleCalendarCallback);
// Ruta para verificar si el psicólogo ya está vinculado a Google Calendar
router.get('/calendar-verificar/:psicologo_id', psicologoController.verificarConexionCalendarController);

// Ruta para listar a psicologos
router.get('/listar-psicologo', psicologoController.listarPsicologos);
// Ruta para listar psicologos por ID
router.get('/buscar-psicologo/:id', psicologoController.obtenerPsicologoPorUsuarioId);
// Perfil del psicólogo
router.get('/perfil/:usuario_id', authPsicologo, psicologoController.obtenerPerfilPsicologo);


// Ruta para obtener la disponibilidad de un psicólogo
router.get('/disponibilidad/:id', psicologoController.obtenerDisponibilidadPorId);
// Ruta para listar las horas ocupadas
router.get('/horas-ocupadas/:psicologo_id/:fecha', psicologoController.obtenerHorasOcupadas);
// Ruta para crear una nueva disponibilidad
router.post('/disponibilidad/crear', authPsicologo, disponibilidad.crearDisponibilidadPsicologo);
// Ruta para editar disponibilidad
router.put("/disponibilidad/editar/:id", authPsicologo, disponibilidad.cambiarDisponibilidad);
// Ruta para eliminar disponibilidad:
router.delete("/disponibilidad/eliminar/:dia/:turno", verificarToken,disponibilidad.quitarDisponibilidad);


// Ruta para listar citas de un psicólogo
router.get('/citas', authPsicologo, psicologoController.obtenerCitasDelPsicologo);
// Ruta para cancelar estado de cita
router.put('/citas/estado', authPsicologo,psicologoController.cambiarEstadoCita);
// Ruta para obtener citas por estudiante
router.get('/citas-aceptadas', authPsicologo, psicologoController.obtenerCitasAceptadas);
// Ruta para cancelar cita activas por estudiante
router.put('/cancelar-cita-psicologo', authPsicologo, psicologoController.cancelarCitaPsicologo);
// Crear cita de seguimiento
router.post('/crear-cita-seguimiento', authPsicologo, psicologoController.crearCitaSeguimiento);
// Listar citas de estudiantes
router.get('/historial-canceladas/:estudiante_id', authPsicologo, psicologoController.obtenerHistorial);


// Listar estudiantes relacionados con el psicologo
router.get('/estudiantes-relacionados/:psicologo_id', authPsicologo, psicologoController.estudiantePorPsicologo);

module.exports = router;