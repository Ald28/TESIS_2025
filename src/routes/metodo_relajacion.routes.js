const metodo = require('../controllers/metodo_relajacion.controller');
const authPsicologo = require('../middlewares/authPsicologo');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer(); 

// Ruta para subir métodos de relajación
router.post('/subir-metodo', authPsicologo, upload.single('archivo'), metodo.subirMetodoRelajacion);

//Listar metodos privados
router.get('/privados/:estudiante_id', metodo.listarMetodosPrivados);

// Listar métodos recomendados
router.get('/recomendados', metodo.listarMetodosRecomendados);

// Listar todos los métodos privados
router.get('/privados-todos', metodo.listarTodosMetodosPrivados);

// Editar actividades recomendadas
router.put('/actividades/editar/:id', authPsicologo, upload.single('archivo'), metodo.editarMetodoRelajacion);

// Eliminar método
router.delete('/actividades/eliminar/:id', authPsicologo, metodo.eliminarMetodoRelajacion);

module.exports = router;