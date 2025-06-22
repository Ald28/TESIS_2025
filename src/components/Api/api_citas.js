import axios from "axios";

const API = import.meta.env.VITE_API_BASE +"/auth/psicologo";
const API_ESTUDIANTE = import.meta.env.VITE_API_BASE +'/auth';

export const obtenerCitasAceptadas = async (token) => {
    const response = await axios.get(`${API}/citas-aceptadas`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.citas;
};

export const cancelarCitaAceptada = async (token, cita_id, creado_por) => {
    const endpoint = creado_por === 'psicologo'
        ? `${API}/cancelar-cita-seguimiento`
        : `${API}/cancelar-cita-psicologo`;

    const response = await axios.put(endpoint, { cita_id }, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

export const crearCitaSeguimiento = async (token, datosCita) => {
    const response = await axios.post(`${API}/crear-cita-seguimiento`, datosCita, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const listarEstudiantes = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`${API_ESTUDIANTE}/estudiantes`, {
            headers: {
                'Authorization': token,
            },
        });

        return response.data.estudiantes;
    } catch (error) {
        console.error('Error al listar estudiantes:', error.response?.data || error.message);
        throw error;
    }
};

export const listarEstudiantesRelacionados = async (psicologo_id) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API}/estudiantes-relacionados/${psicologo_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.estudiantes;
    } catch (error) {
        console.error("Error al obtener estudiantes relacionados:", error.response?.data || error.message);
        throw error;
    }
};