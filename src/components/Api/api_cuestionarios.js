import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cuestionario';

// Crear cuestionario
export const crearCuestaionario = async (datos) => {
    try {
        const response = await axios.post(`${API_URL}/cuestionario`, datos);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Obtener cuestionarios por psicologo:
export const cuestionarioPorPiscologo = async (psicologo_id) => {
    try {
        const response = await axios.get(`${API_URL}/cuestionario/${psicologo_id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};