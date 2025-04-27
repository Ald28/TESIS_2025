import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// 🔹 Crear nueva pregunta
export const crearPregunta = async (preguntaData) => {
  const response = await axios.post(`${API_URL}/crear-pregunta`, preguntaData);
  return response.data;
};

// 🔹 Crear nueva opción para una pregunta
export const crearOpcion = async (opcionData) => {
  const response = await axios.post(`${API_URL}/crear-opcion`, opcionData);
  return response.data;
};

// 🔹 Listar respuestas por estudiante
export const listarTodasLasRespuestas = async () => {
  const response = await axios.get(`${API_URL}/respuestas`);
  return response.data;
};

// 🔹 Listar todas las preguntas con sus opciones
export const listarPreguntasConOpciones = async () => {
  const response = await axios.get(`${API_URL}/listar-preguntas-opciones`);
  return response.data;
};