const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacion.controller');

router.post('/guardar-token-fcm', notificacionController.guardarTokenFCM);
router.post('/enviar-notificacion', notificacionController.enviarNotificacion);

module.exports = router;