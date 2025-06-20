import axios from "axios";
const API = "http://localhost:8080/auth/admin";

export const editarPsicologo = async (usuario_id, psicologoData) => {
    try {
        const response = await axios.put(`${API}/psicologo/${usuario_id}`, psicologoData);
        return response.data;
    } catch (error) {
        console.error("Error al editar psicólogo:", error);
        throw error;
    }
};