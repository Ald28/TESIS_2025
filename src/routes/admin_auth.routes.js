const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_auth.controller');

// RUTA PREDETERMINADA localhost:8080/auth/admin
router.get('/disponibilidad/turnos/:psicologo_id', adminController.listarDisponibilidadPorTurno);
router.get('/historial-estudiantes/:usuario_id', adminController.obtenerHistorial);
router.get('/psicologos', adminController.obtenerPsicologos);
router.get('/listar', adminController.obtenerEstudiantes);

router.post('/psicologos/registrar', adminController.registrarPsicologo);
router.post('/activar/:usuario_id', adminController.activarPsicologo);
router.post('/login', adminController.loginAdmin);

router.delete('/eliminar/:usuario_id', adminController.eliminarPsicologo);
router.put('/psicologo/:usuario_id', adminController.editarPsicologo);

module.exports = router;