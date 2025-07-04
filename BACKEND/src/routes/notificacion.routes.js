const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacion.controller');
const { revisarInactividad, notificarCitasProximas } = require('../controllers/inactividad.controller');

router.post('/guardar-token-fcm', notificacionController.guardarTokenFCM);
router.post('/enviar-notificacion', notificacionController.enviarNotificacion);
router.get('/listar/:usuario_id', notificacionController.listarNotificaciones);
router.delete('/eliminar/:id', notificacionController.eliminarNotificacion);
router.get("/verificar-token-fcm/:token", notificacionController.verificarTokenFCM);
router.get('/revisar-inactividad', revisarInactividad);
router.get('/notificar-citas-proximas', notificarCitasProximas);

module.exports = router;