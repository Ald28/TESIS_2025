import axios from "axios";

const API = "http://localhost:8080/auth/admin";
const API_PSICO = "http://localhost:8080/auth/psicologo";
//const API_PSICO = "http://localhost:8080/auth/psicologo";
//const API_PSICO = "https://tesis-2025.onrender.com/auth/psicologo";

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

export const getHistorialRealizadas = async (usuario_id) => {
  try {
    const response = await axios.get(`${API}/historial-estudiantes/${usuario_id}`);
    return response.data; 
  } catch (error) {
    console.error("Error al obtener historial de cancelaciones:", error);
    throw error;
  }
};

export const getHistorialPendientes = async (usuario_id) => {
  try {
    const response = await axios.get(`${API}/historial-pendientes/${usuario_id}`);
    return response.data; 
  } catch (error) {
    console.error("Error al obtener historial pendientes:", error);
    throw error;
  }
};

export const getPsicologos = async (estado = "activo") => {
    try {
        const response = await axios.get(`${API}/psicologos?estado=${estado}`);
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

export const editarPsicologo = async (usuario_id, psicologoData) => {
    try {
        const response = await axios.put(`${API}/psicologo/${usuario_id}`, psicologoData);
        return response.data;
    } catch (error) {
        console.error("Error al editar psicólogo:", error);
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

export const eliminarPsicologo = async (usuario_id) => {
    console.log("Eliminando psicólogo con ID:", usuario_id);
    try {
        const response = await axios.delete(`${API}/eliminar/${usuario_id}`);
        return response.data;
    } catch (error) {
        console.log("Error al eliminar psicólogo:", error.message);
        console.error("Error al eliminar psicólogo:", error);
        throw error;
    }
};

export const activarPsicologo = async (usuario_id) => {
    try {
        const response = await axios.post(`${API}/activar/${usuario_id}`);
        return response.data;
    } catch (error) {
        console.error("Error al activar psicólogo:", error);
        throw error;
    }
};