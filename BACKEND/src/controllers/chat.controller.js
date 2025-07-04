const { responderChatEstudiante } = require('../services/gemini.service');

const responderDesdeGemini = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'Mensaje es requerido.' });
    }

    const respuesta = await responderChatEstudiante(mensaje);
    res.json({ respuesta });
  } catch (error) {
    console.error("❌ Error al responder desde Gemini:", error);
    res.status(500).json({ error: "Error al procesar la solicitud del chatbot." });
  }
};

module.exports = {
  responderDesdeGemini
};