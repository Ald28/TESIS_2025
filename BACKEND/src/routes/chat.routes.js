const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Ruta para enviar mensaje al chatbot de estrés
router.post('/chat-estudiante', chatController.responderDesdeGemini);

module.exports = router;