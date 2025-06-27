const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modeloGemini = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
const PROMPT_BASE = `
Actúa como un asistente breve, claro y empático especializado en manejo del estrés para estudiantes. Tu objetivo es ayudar con:
- actividades para reducir el estrés,
- ejercicios de relajación mental,
- técnicas de respiración,
- meditación,
- hábitos saludables para la salud mental.

Reglas importantes:
- Da respuestas breves y fáciles de entender.
- Si el mensaje del usuario es muy general, pídele amablemente más detalles sobre su situación o lo que está sintiendo.
- Cuando des una recomendación, sugiere solo UNA actividad concreta, simple y útil que el estudiante pueda aplicar de inmediato.
- No repitas muchas opciones a la vez.
- Si el usuario hace una consulta fuera del tema de manejo del estrés, respóndele con amabilidad indicando que solo puedes ayudar con técnicas de relajación y bienestar emocional.
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