import axios from "axios";

const API_URL = "http://localhost:8080/api/pregunta/";

// Crear una pregunta individualmente
export const crearPregunta = async (datos) => {
  try {
    const response = await axios.post(`${API_URL}/pregunta`, datos);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
