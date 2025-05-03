import axios from "axios";

const API = "http://localhost:8080/auth";

export const obtenerCitasAceptadas = async (token) => {
    const response = await axios.get(`${API}/citas-aceptadas`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.citas;
};

export const cancelarCitaAceptada = async (token, cita_id) => {
    const response = await axios.put(
        `${API}/cancelar-cita-psicologo`,
        { cita_id },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};
