import axios from "axios";

const API = "http://localhost:8080/auth/admin";
const API_PSICO = "http://localhost:8080/auth/psicologo";

export const login = async (correo, contrasena) => {
    try {
        const response = await axios.post(`${API}/login`, { correo, contrasena });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}

export const getEstudiantes = async () => {
    try {
        const response = await axios.get(`${API}/listar`);
        return response.data.datos;
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        throw error;
    }
};

export const getPsicologos = async () => {
    try {
        const response = await axios.get(`${API}/psicologos`);
        return response.data.datos;
    } catch (error) {
        console.error("Error al obtener psicólogos:", error);
        throw error;
    }
};

export const registrarPsicologo = async (psicologoData) => {
    try {
        const response = await axios.post(`${API}/psicologos/registrar`, psicologoData);
        return response.data;
    } catch (error) {
        console.error("Error al registrar psicólogo:", error);
        throw error;
    }
};

export const getDisponibilidadPorPsicologo = async (id) => {
  try {
    const response = await axios.get(`${API_PSICO}/disponibilidad/${id}`);
    return response.data.disponibilidad;
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    throw error;
  }
};