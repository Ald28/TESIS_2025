const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_auth.controller');

// RUTA PREDETERMINADA localhost:8080/auth/admin
router.post('/login', adminController.loginAdmin);
router.get('/listar', adminController.obtenerEstudiantes);
router.get('/psicologos', adminController.obtenerPsicologos);
router.get('/disponibilidad/turnos/:psicologo_id', adminController.listarDisponibilidadPorTurno);
router.post('/psicologos/registrar', adminController.registrarPsicologo);

module.exports = router;