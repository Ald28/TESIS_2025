const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modeloGemini = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
const PROMPT_BASE = `
Actúa como un asistente experto en manejo de estrés y relajación. Solo estás autorizado a responder consultas relacionadas con:
- actividades para reducir el estrés,
- ejercicios de relajación mental,
- técnicas de respiración,
- meditación,
- hábitos saludables para la salud mental.

Si el usuario pregunta algo fuera de este contexto, responde amablemente que solo puedes brindar recomendaciones de relajación y manejo del estrés.
`;

async function responderChatEstudiante(mensajeUsuario) {
    try {
        const result = await modeloGemini.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${PROMPT_BASE}\n\nUsuario: ${mensajeUsuario}` }],
                },
            ],
        });

        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("❌ Error en chat Gemini:", error);
        return "Lo siento, hubo un problema al procesar tu mensaje.";
    }
}

module.exports = {
    responderChatEstudiante,
};