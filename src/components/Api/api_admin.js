import axios from "axios";
const API = "https://tesis-2025.onrender.com/auth/admin";

export const editarPsicologo = async (usuario_id, psicologoData) => {
    try {
        const response = await axios.put(`${API}/psicologo/${usuario_id}`, psicologoData);
        return response.data;
    } catch (error) {
        console.error("Error al editar psicólogo:", error);
        throw error;
    }
};