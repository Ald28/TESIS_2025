import axios from "axios";

const API_URL = "http://localhost:8080/api/opcion";

export const crearOpcion = async (opcionData) => {
  try {
    const response = await axios.post(`${API_URL}/opcion`,opcionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la opción:", error);
    throw error;
  }
};

export const obtenerOpcionesPorPregunta = async (preguntaId) => {
  try {
    const response = await axios.get(`${API_URL}/opciones/${preguntaId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener opciones:", error);
    throw error;
  }
};