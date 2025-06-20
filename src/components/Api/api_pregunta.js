import axios from "axios";

const API_URL = "https://tesis-2025.onrender.com/api/pregunta";

// Crear una pregunta individualmente
export const crearPregunta = async (datos) => {
  try {
    const response = await axios.post(`${API_URL}/pregunta`, datos);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Obtener pregunta por cuestionario:
export const preguntaPorCuestionario = async (cuestionario_id) => {
  try {
      const response = await axios.get(`${API_URL}/preguntas/${cuestionario_id}`);
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : error;
  }
};