import axios from "axios";

const API = "http://localhost:8080/auth/admin";

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

export const crearDisponibilidad = async (disponibilidad) => {
    try {
        const response = await axios.post(`${API}/disponibilidad/crear-turno`, disponibilidad);
        return response.data;
    } catch (error) {
        console.error("Error al crear disponibilidad:", error);
        throw error;
    }
};